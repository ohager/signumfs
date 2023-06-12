"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignumFS = exports.Defaults = void 0;
const util_1 = require("util");
const path_1 = require("path");
const fs_1 = require("fs");
const core_1 = require("@signumjs/core");
const crypto_1 = require("@signumjs/crypto");
const events_1 = require("events");
const crypto_2 = require("crypto");
const util_2 = require("@signumjs/util");
const convertTransactionId_1 = require("./lib/convertTransactionId");
const calculateTransactionFee_1 = require("./lib/calculateTransactionFee");
const dryLedger_1 = require("./lib/dryLedger");
const ledgerReadStream_1 = require("./lib/ledgerReadStream");
const promises_1 = require("fs/promises");
const KibiByte = 1024;
const MebiByte = 1024 * KibiByte;
exports.Defaults = {
    ChunkSize: 128,
    MaxUpload: 5 * MebiByte
};
class SignumFS extends events_1.EventEmitter {
    constructor({ nodeHost, seed, dryRun, chunksPerBlock = exports.Defaults.ChunkSize }) {
        super();
        this.ledger = dryRun
            ? dryLedger_1.DryLedger
            : core_1.LedgerClientFactory.createClient({ nodeHost });
        this.keys = (0, crypto_1.generateMasterKeys)(seed);
        this.dryRun = dryRun;
        this.chunksPerBlock = chunksPerBlock;
    }
    getFileInfo(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield (0, util_1.promisify)(fs_1.stat)(filePath);
            if (!info.isFile()) {
                throw new Error(`Not a file: ${filePath}`);
            }
            if (!info.size) {
                throw new Error(`File is empty: ${filePath}`);
            }
            if (info.size > exports.Defaults.MaxUpload) {
                throw new Error(`File exceeds allowed size limit (${exports.Defaults.MaxUpload} byte): ${filePath}`);
            }
            return {
                size: info.size,
                name: (0, path_1.basename)(filePath),
            };
        });
    }
    uploadFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this.getFileInfo(filePath);
            const reader = (0, fs_1.createReadStream)(filePath, {
                encoding: "hex",
                highWaterMark: 1000 - 8,
            });
            const { txId, sha512, chunkCount } = yield this.uploadChunks(reader);
            return this.createMetadata({ info, txId, sha512, chunkCount });
        });
    }
    uploadChunks(readable) {
        var _a, readable_1, readable_1_1;
        var _b, e_1, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const hash = (0, crypto_2.createHash)("sha512");
            let txId = "0000000000000000";
            let refHash = "";
            let chunkCount = 0;
            try {
                for (_a = true, readable_1 = __asyncValues(readable); readable_1_1 = yield readable_1.next(), _b = readable_1_1.done, !_b; _a = true) {
                    _d = readable_1_1.value;
                    _a = false;
                    const chunk = _d;
                    const message = (0, convertTransactionId_1.transactionIdToHex)(txId) + chunk;
                    hash.update(chunk);
                    const { transaction, fullHash } = yield this.uploadDataToLedger(message, false, refHash);
                    txId = transaction;
                    if (++chunkCount % this.chunksPerBlock === 0) {
                        refHash = fullHash;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_a && !_b && (_c = readable_1.return)) yield _c.call(readable_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // TODO: consider compression
            return {
                sha512: hash.digest("hex"),
                txId,
                chunkCount,
            };
        });
    }
    downloadFile(metadataTxId) {
        return __awaiter(this, void 0, void 0, function* () {
            const readable = new ledgerReadStream_1.LedgerReadStream(metadataTxId, this.ledger);
            const { data, sha512 } = yield this.downloadChunks(readable);
            if (!readable.metadata) {
                throw new Error("No metadata available");
            }
            if (readable.metadata.xcmp) {
                // TODO: consider decompression
            }
            yield (0, promises_1.writeFile)('signum-' + readable.metadata.nm, data);
            if (readable.metadata.xsha512 !== sha512) {
                throw new Error("Hashes don't match - most probably the downloaded file is corrupted");
            }
            return readable.metadata;
        });
    }
    downloadChunks(readable) {
        var _a, readable_2, readable_2_1;
        var _b, e_2, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            let buf = null;
            const hash = (0, crypto_2.createHash)("sha512");
            try {
                for (_a = true, readable_2 = __asyncValues(readable); readable_2_1 = yield readable_2.next(), _b = readable_2_1.done, !_b; _a = true) {
                    _d = readable_2_1.value;
                    _a = false;
                    const chunk = _d;
                    hash.update(chunk.toString('hex'));
                    buf = !buf ? chunk : Buffer.concat([chunk, buf]);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_a && !_b && (_c = readable_2.return)) yield _c.call(readable_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            if (!buf) {
                throw Error('No data!');
            }
            return {
                data: buf,
                sha512: hash.digest('hex')
            };
        });
    }
    createMetadata({ txId, sha512, info, chunkCount, }) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const transaction = yield this.uploadDataToLedger(JSON.stringify(metadata), true);
            return {
                feePlanck: util_2.Amount.fromSigna(0.01)
                    .multiply(chunkCount + 1)
                    .getPlanck(),
                transaction,
                metadata,
            };
        });
    }
    uploadDataToLedger(data, isText, refHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.ledger.message.sendMessage({
                message: data,
                messageIsText: isText,
                deadline: 24,
                feePlanck: (0, calculateTransactionFee_1.calculateTransactionFee)(data, isText).getPlanck(),
                recipientId: core_1.Address.fromPublicKey(this.keys.publicKey).getNumericId(),
                senderPrivateKey: this.keys.signPrivateKey,
                senderPublicKey: this.keys.publicKey,
                referencedTransactionFullHash: refHash,
            }));
        });
    }
}
exports.SignumFS = SignumFS;
