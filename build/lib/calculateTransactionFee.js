"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTransactionFee = void 0;
const util_1 = require("@signumjs/util");
function calculateTransactionFee(message, isText) {
    const accountableLength = isText ? message.length : message.length / 2;
    const estimatedFeeFactor = Math.max(1, Math.ceil(accountableLength / 176));
    return util_1.Amount.fromSigna(0.01).multiply(estimatedFeeFactor);
}
exports.calculateTransactionFee = calculateTransactionFee;
