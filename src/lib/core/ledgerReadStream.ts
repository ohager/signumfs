import { Readable } from "stream";
import { Ledger } from "@signumjs/core";
import { SignumFSMetaData } from "./metadata";
import { hexToTransactionId } from "./convertTransactionId";
import pRetry from "p-retry";
import * as console from "console";

/**
 * @ignore
 */
class LedgerStreamError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class LedgerReadStream extends Readable {
  private nextTx: string;
  private _metadata: SignumFSMetaData | null = null;

  constructor(private metaDataTxId: string, private ledger: Ledger) {
    super();
    this.nextTx = metaDataTxId;
  }

  get metadata() {
    return this._metadata;
  }

  _construct(callback: (error?: Error | null) => void) {
    // testing reachability
    this.ledger.network
      .getMiningInfo()
      .then(() => callback())
      .catch(() =>
        callback(new LedgerStreamError("Seems that Ledger is not reachable"))
      );
  }

  _read() {
    if (this.nextTx === "0") {
      this.push(null);
      return;
    }
    pRetry(
      async () => {
        try {
          return await this.ledger.transaction.getTransaction(this.nextTx);
        } catch (e: any) {
          throw new Error(e.message);
        }
      },
      {
        onFailedAttempt: (attempt) =>
          console.debug(
            `Could not fetch transaction [${this.nextTx}]:`,
            attempt.message,
            `- retrying ${attempt.attemptNumber}/${attempt.retriesLeft}`
          ),
      }
    )
      .then((tx) => {
        if (!(tx.attachment && tx.attachment["version.Message"])) {
          this.destroy(
            new LedgerStreamError("Transaction has no message attachment")
          );
        }
        if (this.nextTx === this.metaDataTxId) {
          this._metadata = this.parseMetadata(tx.attachment.message);
          this.nextTx = this._metadata.xid;
          return this._read();
        }
        this.nextTx = hexToTransactionId(
          tx.attachment.message.substring(0, 16)
        );
        this.push(tx.attachment.message.substring(16), "hex");
      })
      .catch((e) => {
        this.destroy(
          new LedgerStreamError(`Reading Ledger failed: ${e.message}`)
        );
      });
  }

  _destroy(error: Error | null, callback: (error?: Error | null) => void) {
    super._destroy(error, callback);
  }

  private parseMetadata(attachmentMessage: string) {
    let src44;
    try {
      src44 = JSON.parse(attachmentMessage);
    } catch (e) {
      throw new LedgerStreamError("Attachment is not JSON data");
    }

    const { xapp, nm, xsize, xchunks, xid, xsha512 } = src44;

    if (xapp !== "SignumFS") {
      throw new LedgerStreamError("Expected xapp to be 'SignumFS'");
    }

    if (!nm || !xsize || !xchunks || !xid || !xsha512) {
      throw new LedgerStreamError("Corrupt Metadata");
    }

    return src44 as SignumFSMetaData;
  }
}
