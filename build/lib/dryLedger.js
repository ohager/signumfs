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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DryLedger = void 0;
const crypto_1 = require("@signumjs/crypto");
const convertTransactionId_1 = require("./convertTransactionId");
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
function generateFakeTx(text) {
    const hash = (0, crypto_1.hashSHA256)(text);
    return {
        fullHash: hash,
        transaction: (0, convertTransactionId_1.hexToTransactionId)(hash.substring(0, 16)),
        signatureHash: hash,
        numberOfPeersSentTo: 0,
        broadcasted: false,
        requestProcessingTime: 0,
        transactionBytes: "",
        transactionJSON: {},
        unsignedTransactionBytes: "",
    };
}
// @ts-ignore
exports.DryLedger = {
    message: {
        sendMessage: ({ message }) => __awaiter(void 0, void 0, void 0, function* () {
            yield sleep(50);
            return generateFakeTx(message);
        }),
        sendEncryptedMessage: ({ message }) => __awaiter(void 0, void 0, void 0, function* () {
            yield sleep(50);
            return generateFakeTx(message);
        })
    },
};
