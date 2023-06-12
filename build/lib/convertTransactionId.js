"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexToTransactionId = exports.transactionIdToHex = void 0;
const util_1 = require("@signumjs/util");
function transactionIdToHex(txId) {
    return (0, util_1.convertDecStringToHexString)(txId).padStart(16, "0");
}
exports.transactionIdToHex = transactionIdToHex;
function hexToTransactionId(hex) {
    return (0, util_1.convertHexStringToDecString)(hex);
}
exports.hexToTransactionId = hexToTransactionId;
