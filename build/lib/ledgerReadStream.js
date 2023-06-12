"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerReadStream = void 0;
const stream_1 = require("stream");
const convertTransactionId_1 = require("./convertTransactionId");
class LedgerStreamError extends Error {
    constructor(message) {
        super(message);
    }
}
class LedgerReadStream extends stream_1.Readable {
    constructor(metaDataTxId, ledger) {
        super();
        this.metaDataTxId = metaDataTxId;
        this.ledger = ledger;
        this._metadata = null;
        this.nextTx = metaDataTxId;
    }
    get metadata() {
        return this._metadata;
    }
    _construct(callback) {
        // testing reachability
        this.ledger.network
            .getMiningInfo()
            .then(() => callback())
            .catch(() => callback(new LedgerStreamError("Seems that Ledger is not reachable")));
    }
    _read() {
        if (this.nextTx === "0") {
            this.push(null);
            return;
        }
        this.ledger.transaction
            .getTransaction(this.nextTx)
            .then((tx) => {
            if (!(tx.attachment && tx.attachment["version.Message"])) {
                this.destroy(new LedgerStreamError("Transaction has no message attachment"));
            }
            if (this.nextTx === this.metaDataTxId) {
                this._metadata = this.parseMetadata(tx.attachment.message);
                this.nextTx = this._metadata.xid;
                return this._read();
            }
            this.nextTx = (0, convertTransactionId_1.hexToTransactionId)(tx.attachment.message.substring(0, 16));
            this.push(tx.attachment.message.substring(16), "hex");
        })
            .catch((e) => {
            this.destroy(new LedgerStreamError(`Reading Ledger failed: ${e.message}`));
        });
    }
    _destroy(error, callback) {
        super._destroy(error, callback);
    }
    parseMetadata(attachmentMessage) {
        let src44;
        try {
            src44 = JSON.parse(attachmentMessage);
        }
        catch (e) {
            throw new LedgerStreamError("Attachment is not JSON data");
        }
        const { xapp, nm, xsize, xchunks, xid, xsha512 } = src44;
        if (xapp !== "SignumFS") {
            throw new LedgerStreamError("Expected xapp to be 'SignumFS'");
        }
        if (!nm || !xsize || !xchunks || !xid || !xsha512) {
            throw new LedgerStreamError("Corrupt Metadata");
        }
        return src44;
    }
}
exports.LedgerReadStream = LedgerReadStream;
