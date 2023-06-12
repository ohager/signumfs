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

export interface SignumFSContext {
  nodeHost: string;
  seed: string;
  dryRun: boolean;
  chunksPerBlock: number;
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
}
//
export class SignumFS extends EventEmitter {
  private readonly ledger: Ledger;
  private readonly keys: Keys;
  private readonly dryRun: boolean;
  private readonly chunksPerBlock: number;

  constructor({ nodeHost, seed, dryRun, chunksPerBlock }: SignumFSContext) {
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

    return {
      size: info.size,
      name: basename(filePath),
    } as SignumFSFileInfo;
  }

  async uploadFile(filePath: string) {
    const info = await this.getFileInfo(filePath);
    const reader = createReadStream(filePath, {
      encoding: "hex",
      highWaterMark: 1000 - 8,
    });
    const { txId, sha512, chunkCount } = await this.uploadChunks(reader);
    return this.createMetadata({ info, txId, sha512, chunkCount });
  }

  private async uploadChunks(readable: Readable) {
    const hash = createHash("sha512");
    let txId = "0000000000000000";
    let refHash = "";
    let chunkCount = 0;
    for await (const chunk of readable) {
      const message = transactionIdToHex(txId) + chunk;
      hash.update(chunk);
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

    return {
      sha512: hash.digest("hex"),
      txId,
      chunkCount,
    };
  }

  async downloadFile(txId: string) {}

  private async createMetadata({
    txId,
    sha512,
    info,
    chunkCount,
  }: CreateMetadataArgs) {
    const metadata = {
      vs: 1,
      tp: "OTH",
      nm: info.name,
      xapp: "SignumFS",
      xsize: info.size,
      xchunks: chunkCount,
      xid: txId,
      xsha512: sha512,
    };
    const transaction = this.uploadDataToLedger(JSON.stringify(metadata), true);
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
      feePlanck: calculateTransactionFee(data).getPlanck(),
      recipientId: Address.fromPublicKey(this.keys.publicKey).getNumericId(), // send to self
      senderPrivateKey: this.keys.signPrivateKey,
      senderPublicKey: this.keys.publicKey,
      referencedTransactionFullHash: refHash,
    })) as TransactionId;
  }
}
