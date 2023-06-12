import {
  convertDecStringToHexString,
  convertHexStringToDecString,
} from "@signumjs/util";
export function transactionIdToHex(txId) {
  return convertDecStringToHexString(txId).padStart(16, "0");
}
export function hexToTransactionId(hex) {
  return convertHexStringToDecString(hex);
}
