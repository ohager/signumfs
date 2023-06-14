import { promisify } from "util";
import { basename, join } from "path";
import { createReadStream, createWriteStream } from "fs";
import {
  Address,
  Ledger,
  LedgerClientFactory,
  TransactionArbitrarySubtype,
  TransactionId,
  TransactionType,
} from "@signumjs/core";
import { generateMasterKeys, Keys } from "@signumjs/crypto";
import { Readable } from "stream";
import { EventEmitter } from "events";
import { createHash } from "crypto";
import { Amount } from "@signumjs/util";
import { writeFile, stat } from "fs/promises";
import { brotliDecompress, createBrotliCompress } from "zlib";
import { transactionIdToHex } from "@lib/core/convertTransactionId";
import {
  calculateTransactionFee,
  calculateTransactionFeePerMessage,
} from "@lib/core/calculateTransactionFee";
import { DryLedger } from "@lib/core/dryLedger";
import { LedgerReadStream } from "@lib/core/ledgerReadStream";
import { SignumFSMetaData } from "@lib/core/metadata";
import { cwd } from "process";
import * as StreamPromises from "stream/promises";
import pRetry from "p-retry";
import console from "console";

/**
 * Creation context for {@link SignumFS} class
 */
export interface SignumFSContext {
  /**
   * The url of the node used
   */
  nodeHost: string;
  /**
   * The seed/recovery phrase of the account that wants to upload (for download not really needed)
   */
  seed: string;
  /**
   * Flag to run a test up/download without accessing the blockchain
   * @note It uses a mock ledger instance that has static data.
   */
  dryRun: boolean;
  /**
   * Amount of chunks uploaded/broadcast per block
   * @default 128
   */
  chunksPerBlock?: number;
}

interface SignumFSFileInfo {
  size: number;
  name: string;
}

/**
 * @internal
 */
interface CreateMetadataArgs {
  txId: string;
  sha512: string;
  info: SignumFSFileInfo;
  chunkCount: number;
  compressedSize?: number;
}

/**
 * Argument object for {@link SignumFS.uploadFile}
 */
interface UploadFileArgs {
  /**
   * The path of file to be uploaded
   */
  filePath: string;
  /**
   * If set 'true', the file will be compressed before uploading.
   * @note media files are usually pretty good compressed already. Use compression for text and document files.
   * @default false
   */
  shouldCompress?: boolean;
}

interface UploadFileResult {
  sha512: string;
  txId: string;
  chunkCount: number;
  size: number;
}

interface DownloadFileArgs {
  metadataTransactionId: string;
  filePath?: string;
}

const KibiByte = 1024;
const MebiByte = 1024 * KibiByte;

/**
 * @ignore
 */
export const Defaults = {
  ChunkSize: 160,
  MaxUpload: MebiByte,
};

/**
 * Signum File System class
 *
 * Up- and download files to [Signum blockchain](https://signum.network)
 *
 */
export class SignumFS extends EventEmitter {
  private readonly ledger: Ledger;
  private readonly keys: Keys;
  private readonly dryRun: boolean;
  private readonly chunksPerBlock: number;

  /**
   * Constructor
   * @param nodeHost The url of the host to be used
   * @param seed The seed/recovery phrase of the uploading account (not necessary for download
   * @param dryRun If set `true` no ledger access will be done. Good for simulate an upload!
   * @param chunksPerBlock Number of chunks/transactions per block. @default 128
   */
  constructor({
    nodeHost,
    seed,
    dryRun,
    chunksPerBlock = Defaults.ChunkSize,
  }: SignumFSContext) {
    super();
    this.ledger = dryRun
      ? DryLedger
      : LedgerClientFactory.createClient({ nodeHost });
    this.keys = generateMasterKeys(seed);
    this.dryRun = dryRun;
    this.chunksPerBlock = chunksPerBlock;
  }

  public getLedger(): Ledger {
    return this.ledger;
  }

  private async getFileInfo(filePath: string) {
    const info = await stat(filePath);
    if (!info.isFile()) {
      throw new Error(`Not a file: ${filePath}`);
    }
    if (!info.size) {
      throw new Error(`File is empty: ${filePath}`);
    }

    if (info.size > Defaults.MaxUpload) {
      throw new Error(
        `File exceeds allowed size limit (${
          Defaults.MaxUpload / KibiByte
        } KiB): ${filePath}`
      );
    }

    return {
      size: info.size,
      name: basename(filePath),
    } as SignumFSFileInfo;
  }

  /**
   * List all files uploaded per account
   * @param accountId
   */
  async listFiles(accountId: string) {
    let firstIndex = 0;
    const files: Record<string, SignumFSMetaData> = {};
    while (firstIndex !== -1) {
      const { nextIndex, transactions } =
        await this.ledger.account.getAccountTransactions({
          type: TransactionType.Arbitrary,
          subtype: TransactionArbitrarySubtype.Message,
          accountId,
          includeIndirect: false,
          firstIndex,
          lastIndex: firstIndex + 500,
        });

      for (let tx of transactions) {
        try {
          if (tx.attachment && tx.attachment.message) {
            const json = JSON.parse(tx.attachment.message);
            if (json.tp === "FIL" && json.xapp === "SignumFS") {
              files[tx.transaction] = json;
            }
          }
        } catch (_: any) {
          // ignore
        }
      }
      firstIndex = nextIndex ?? -1;
    }
    return files;
  }

  /**
   * Uploads a file to the blockchain
   * @see {@link SignumFS.downloadFile} to download a file
   * @param filePath The path of the file to be uploaded
   * @param shouldCompress Whether data shall be compressed before upload. @default false
   * @fires SignumFS#start
   * @fires SignumFS#progress
   * @fires SignumFS#finish
   */
  async uploadFile({ filePath, shouldCompress }: UploadFileArgs) {
    const info = await this.getFileInfo(filePath);
    let infilePath = filePath;
    if (shouldCompress) {
      infilePath = join(cwd(), info.name + ".br");
      await StreamPromises.pipeline([
        createReadStream(filePath),
        createBrotliCompress(),
        createWriteStream(infilePath),
      ]);
    }

    let fileReadStream = createReadStream(infilePath, {
      encoding: "hex",
      highWaterMark: 1000 - 8,
    });

    /**
     * Upload start event
     * @event SignumFS#start
     * @type {object}
     * @property info {SignumFSFileInfo} File info data
     */
    this.emit("start", { info });
    const result = await this.uploadChunks(fileReadStream);

    const { txId, sha512, chunkCount, size } = result;
    const metadata = await this.createMetadata({
      info,
      txId,
      sha512,
      chunkCount,
      compressedSize: shouldCompress ? size : undefined,
    });
    /**
     * Upload finish event
     * @event SignumFS#finish
     * @type {object}
     * @property metadata {SignumFSMetaData} meta data on chain (SRC44)
     * @property transaction {string} The transaction id of the metadata (starting transaction)
     * @property feePlanck {string} The total costs in planck
     */
    this.emit("finish", metadata);
    return metadata;
  }

  private async uploadChunks(readable: Readable): Promise<UploadFileResult> {
    const hash = createHash("sha512");
    let txId = "0000000000000000";
    let refHash = "";
    let chunkCount = 0;
    let hexSize = 0;
    for await (const chunk of readable) {
      const message = transactionIdToHex(txId) + chunk;
      hash.update(chunk);
      hexSize += chunk.length;
      // @ts-ignore
      const { transaction, fullHash } = await this.uploadDataToLedger(
        message,
        false,
        refHash
      );
      txId = transaction;
      if (++chunkCount % this.chunksPerBlock === 0) {
        refHash = fullHash;
      }
      /**
       * Upload progress event
       * @event SignumFS#progress
       * @type {object}
       * @property chunkCount {number} uploaded chunk count
       * @property uploaded {number} Amount of uploaded data in bytes
       */
      this.emit("progress", { chunkCount, uploaded: hexSize / 2 });
    }

    return {
      sha512: hash.digest("hex"),
      txId,
      chunkCount,
      size: hexSize / 2,
    };
  }

  /**
   * Downloads file
   * @param metadataTransactionId The transaction id of the meta data (returned by {@link SignumFS.uploadFile}
   * @param filePath {optional} The alternative file path for downloaded file, otherwise name from meta data is being used
   * @fires SignumFS#start
   * @fires SignumFS#progress
   * @fires SignumFS#finish
   */
  async downloadFile({ metadataTransactionId, filePath }: DownloadFileArgs) {
    const readable = new LedgerReadStream(metadataTransactionId, this.ledger);
    /**
     * Download start event
     * @event SignumFS#start
     * @type {object}
     * @property transaction {string} The starting transaction id (metadata)
     */
    this.emit("start", { transaction: metadataTransactionId });
    const { data, sha512 } = await this.downloadChunks(readable);
    let buf = data;
    if (!readable.metadata) {
      throw new Error("No metadata available");
    }

    if (readable.metadata.xsha512 !== sha512) {
      throw new Error(
        "Hashes don't match - most probably the downloaded file is corrupted"
      );
    }

    if (readable.metadata.xcmp === "br") {
      buf = await promisify(brotliDecompress)(data);
    }

    await writeFile(filePath ?? readable.metadata.nm, buf);
    /**
     * Download finish event
     * @event SignumFS#finish
     * @type {object}
     * @property metadata {SignumFSMetaData} meta data on chain (SRC44)
     */
    this.emit("finished", { metadata: readable.metadata });
    return readable.metadata;
  }

  private async downloadChunks(readable: LedgerReadStream) {
    let data: Buffer | null = null;
    const hash = createHash("sha512");
    let chunkCount = 0;
    for await (const chunk of readable) {
      data = !data ? chunk : Buffer.concat([chunk, data]);
      if (readable.metadata) {
        const { xchunks, xcms, xsize } = readable.metadata;
        /**
         * Download progress event
         * @event SignumFS#progress
         * @type {object}
         * @property chunk {number} downloaded chunk count
         * @property chunks {number} total chunks to download
         * @property downloaded {number} Amount of downloaded data in bytes
         * @property size {number} Total amount of data in bytes
         */
        this.emit("progress", {
          chunk: ++chunkCount,
          chunks: xchunks,
          downloaded: data?.length ?? 0,
          size: xcms ?? xsize,
        });
      }
    }
    if (!data) {
      throw Error("No data!");
    }
    hash.update(data.toString("hex"));
    return {
      data,
      sha512: hash.digest("hex"),
    };
  }

  private async createMetadata({
    txId,
    sha512,
    info,
    chunkCount,
    compressedSize,
  }: CreateMetadataArgs) {
    const metadata = {
      vs: 1,
      tp: "FIL",
      nm: info.name,
      xapp: "SignumFS",
      xsize: info.size,
      xchunks: chunkCount,
      xid: txId,
      xsha512: sha512,
    } as SignumFSMetaData;

    if (compressedSize) {
      metadata.xcmp = "br";
      metadata.xcms = compressedSize;
    }
    const transaction = await this.uploadDataToLedger(
      JSON.stringify(metadata),
      true
    );
    const feePlanck = calculateTransactionFee(metadata.xcms ?? metadata.xsize)
      .add(Amount.fromSigna(0.02))
      .getPlanck();
    return {
      feePlanck,
      transaction,
      metadata,
    };
  }

  private async uploadDataToLedger(
    data: string,
    isText: boolean,
    refHash?: string
  ) {
    return pRetry(
      async () => {
        try {
          return (await this.ledger.message.sendMessage({
            message: data,
            messageIsText: isText,
            deadline: 24,
            feePlanck: calculateTransactionFeePerMessage(
              data,
              isText
            ).getPlanck(),
            recipientId: Address.fromPublicKey(
              this.keys.publicKey
            ).getNumericId(), // send to self
            senderPrivateKey: this.keys.signPrivateKey,
            senderPublicKey: this.keys.publicKey,
            referencedTransactionFullHash: refHash,
          })) as TransactionId;
        } catch (e: any) {
          throw new Error("Ledger Exception: " + e.message);
        }
      },
      {
        onFailedAttempt: (attempt) =>
          console.debug(
            `Could not send data:`,
            attempt.message,
            `- retrying ${attempt.attemptNumber}/${attempt.retriesLeft}`
          ),
      }
    );
  }
}
