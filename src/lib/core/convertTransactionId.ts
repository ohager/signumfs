import {
  convertDecStringToHexString,
  convertHexStringToDecString,
} from "@signumjs/util";

export function transactionIdToHex(txId: string) {
  return convertDecStringToHexString(txId).padStart(16, "0");
}

export function hexToTransactionId(hex: string) {
  return convertHexStringToDecString(hex);
}
