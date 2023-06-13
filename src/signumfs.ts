import { promisify } from "util";
import { basename } from "path";
import { stat, createReadStream } from "fs";
import {
  Address,
  Ledger,
  LedgerClientFactory,
  TransactionId,
} from "@signumjs/core";
import { generateMasterKeys, Keys } from "@signumjs/crypto";
import { Readable } from "stream";
import { EventEmitter } from "events";
import { createHash } from "crypto";
import { Amount } from "@signumjs/util";
import { transactionIdToHex } from "./lib/convertTransactionId";
import { calculateTransactionFee } from "./lib/calculateTransactionFee";
import { DryLedger } from "./lib/dryLedger";
import { LedgerReadStream } from "./lib/ledgerReadStream";
import { writeFile } from "fs/promises";
import { createBrotliCompress } from "zlib";

export interface SignumFSContext {
  nodeHost: string;
  seed: string;
  dryRun: boolean;
  chunksPerBlock?: number;
}

interface SignumFSFileInfo {
  size: number;
  name: string;
}

interface CreateMetadataArgs {
  txId: string;
  sha512: string;
  info: SignumFSFileInfo;
  chunkCount: number;
  compressed: boolean;
  size: number;
}

interface UploadFileArgs {
  filePath: string;
  shouldCompress?: boolean;
}
interface DownloadFileArgs {
  metadataTransactionId: string;
  filePath?: string;
}

const KibiByte = 1024;
const MebiByte = 1024 * KibiByte;
export const Defaults = {
  ChunkSize: 128,
  MaxUpload: 2 * MebiByte,
};

export class SignumFS extends EventEmitter {
  private readonly ledger: Ledger;
  private readonly keys: Keys;
  private readonly dryRun: boolean;
  private readonly chunksPerBlock: number;

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

  private async getFileInfo(filePath: string) {
    const info = await promisify(stat)(filePath);
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

  async uploadFile({ filePath, shouldCompress }: UploadFileArgs) {
    const info = await this.getFileInfo(filePath);
    const reader = createReadStream(filePath, {
      encoding: "hex",
      highWaterMark: 1000 - 8,
    });

    if (shouldCompress) {
      reader.pipe(createBrotliCompress());
    }

    const { txId, sha512, chunkCount, size } = await this.uploadChunks(reader);
    return this.createMetadata({
      info,
      txId,
      sha512,
      chunkCount,
      compressed: !!shouldCompress,
      size,
    });
  }

  private async uploadChunks(readable: Readable) {
    const hash = createHash("sha512");
    let txId = "0000000000000000";
    let refHash = "";
    let chunkCount = 0;
    let size = 0;
    for await (const chunk of readable) {
      const message = transactionIdToHex(txId) + chunk;
      hash.update(chunk);
      size += chunk.length;
      const { transaction, fullHash } = await this.uploadDataToLedger(
        message,
        false,
        refHash
      );
      txId = transaction;
      if (++chunkCount % this.chunksPerBlock === 0) {
        refHash = fullHash;
      }
    }

    // TODO: consider compression

    return {
      sha512: hash.digest("hex"),
      txId,
      chunkCount,
      size,
    };
  }

  async downloadFile({ metadataTransactionId, filePath }: DownloadFileArgs) {
    const readable = new LedgerReadStream(metadataTransactionId, this.ledger);
    const { data, sha512 } = await this.downloadChunks(readable);
    if (!readable.metadata) {
      throw new Error("No metadata available");
    }

    if (readable.metadata.xcmp) {
      // TODO: consider decompression
    }

    if (readable.metadata.xsha512 !== sha512) {
      throw new Error(
        "Hashes don't match - most probably the downloaded file is corrupted"
      );
    }

    await writeFile(filePath ?? readable.metadata.nm, data);

    return readable.metadata;
  }

  private async downloadChunks(readable: LedgerReadStream) {
    let data: Buffer | null = null;
    const hash = createHash("sha512");
    for await (const chunk of readable) {
      data = !data ? chunk : Buffer.concat([chunk, data]);
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
    compressed,
    size,
  }: CreateMetadataArgs) {
    const metadata = {
      vs: 1,
      tp: "FIL",
      nm: info.name,
      xapp: "SignumFS",
      xcmp: compressed ? "br" : undefined,
      xcms: size !== info.size ? size : undefined,
      xsize: info.size,
      xchunks: chunkCount,
      xid: txId,
      xsha512: sha512,
    };
    const transaction = await this.uploadDataToLedger(
      JSON.stringify(metadata),
      true
    );
    return {
      feePlanck: Amount.fromSigna(0.01)
        .multiply(chunkCount + 1)
        .getPlanck(),
      transaction,
      metadata,
    };
  }

  private async uploadDataToLedger(
    data: string,
    isText: boolean,
    refHash?: string
  ) {
    return (await this.ledger.message.sendMessage({
      message: data,
      messageIsText: isText,
      deadline: 24,
      feePlanck: calculateTransactionFee(data, isText).getPlanck(),
      recipientId: Address.fromPublicKey(this.keys.publicKey).getNumericId(), // send to self
      senderPrivateKey: this.keys.signPrivateKey,
      senderPublicKey: this.keys.publicKey,
      referencedTransactionFullHash: refHash,
    })) as TransactionId;
  }
}
