import { Ledger, TransactionId } from "@signumjs/core";
import { hashSHA256 } from "@signumjs/crypto";
import { hexToTransactionId } from "./convertTransactionId";

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function generateFakeTx(text: string) {
  const hash = hashSHA256(text);
  return {
    fullHash: hash,
    transaction: hexToTransactionId(hash.substring(0, 16)),
    signatureHash: hash,
    numberOfPeersSentTo: 0,
    broadcasted: false,
    requestProcessingTime: 0,
    transactionBytes: "",
    transactionJSON: {},
    unsignedTransactionBytes: "",
  } as TransactionId;
}
// @ts-ignore
export const DryLedger: Ledger = {
  message: {
    sendMessage: async ({ message }) => {
      await sleep(50);
      return generateFakeTx(message);
    },
    sendEncryptedMessage: async ({ message }) => {
      await sleep(50);
      return generateFakeTx(message);
    },
  },
};
