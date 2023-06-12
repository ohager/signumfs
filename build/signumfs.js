var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __asyncValues =
  (this && this.__asyncValues) ||
  function (o) {
    if (!Symbol.asyncIterator)
      throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator],
      i;
    return m
      ? m.call(o)
      : ((o =
          typeof __values === "function" ? __values(o) : o[Symbol.iterator]()),
        (i = {}),
        verb("next"),
        verb("throw"),
        verb("return"),
        (i[Symbol.asyncIterator] = function () {
          return this;
        }),
        i);
    function verb(n) {
      i[n] =
        o[n] &&
        function (v) {
          return new Promise(function (resolve, reject) {
            (v = o[n](v)), settle(resolve, reject, v.done, v.value);
          });
        };
    }
    function settle(resolve, reject, d, v) {
      Promise.resolve(v).then(function (v) {
        resolve({ value: v, done: d });
      }, reject);
    }
  };
import { promisify } from "util";
import { basename } from "path";
import { stat, createReadStream } from "fs";
import { Address, LedgerClientFactory } from "@signumjs/core";
import { generateMasterKeys } from "@signumjs/crypto";
import { EventEmitter } from "events";
import { createHash } from "crypto";
import { Amount } from "@signumjs/util";
import { transactionIdToHex } from "./lib/convertTransactionId";
import { calculateTransactionFee } from "./lib/calculateTransactionFee";
import { DryLedger } from "./lib/dryLedger";
//
export class SignumFS extends EventEmitter {
  constructor({ nodeHost, seed, dryRun, chunksPerBlock }) {
    super();
    this.ledger = dryRun
      ? DryLedger
      : LedgerClientFactory.createClient({ nodeHost });
    this.keys = generateMasterKeys(seed);
    this.dryRun = dryRun;
    this.chunksPerBlock = chunksPerBlock;
  }
  getFileInfo(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
      const info = yield promisify(stat)(filePath);
      if (!info.isFile()) {
        throw new Error(`Not a file: ${filePath}`);
      }
      if (!info.size) {
        throw new Error(`File is empty: ${filePath}`);
      }
      return {
        size: info.size,
        name: basename(filePath),
      };
    });
  }
  uploadFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
      const info = yield this.getFileInfo(filePath);
      const reader = createReadStream(filePath, {
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
      const hash = createHash("sha512");
      let txId = "0000000000000000";
      let refHash = "";
      let chunkCount = 0;
      try {
        for (
          _a = true, readable_1 = __asyncValues(readable);
          (readable_1_1 = yield readable_1.next()),
            (_b = readable_1_1.done),
            !_b;
          _a = true
        ) {
          _d = readable_1_1.value;
          _a = false;
          const chunk = _d;
          const message = transactionIdToHex(txId) + chunk;
          hash.update(chunk);
          const { transaction, fullHash } = yield this.uploadDataToLedger(
            message,
            false,
            refHash
          );
          txId = transaction;
          if (++chunkCount % this.chunksPerBlock === 0) {
            refHash = fullHash;
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (!_a && !_b && (_c = readable_1.return)) yield _c.call(readable_1);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
      return {
        sha512: hash.digest("hex"),
        txId,
        chunkCount,
      };
    });
  }
  downloadFile(txId) {
    return __awaiter(this, void 0, void 0, function* () {});
  }
  createMetadata({ txId, sha512, info, chunkCount }) {
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
      const transaction = this.uploadDataToLedger(
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
    });
  }
  uploadDataToLedger(data, isText, refHash) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield this.ledger.message.sendMessage({
        message: data,
        messageIsText: isText,
        deadline: 24,
        feePlanck: calculateTransactionFee(data).getPlanck(),
        recipientId: Address.fromPublicKey(this.keys.publicKey).getNumericId(),
        senderPrivateKey: this.keys.signPrivateKey,
        senderPublicKey: this.keys.publicKey,
        referencedTransactionFullHash: refHash,
      });
    });
  }
}
