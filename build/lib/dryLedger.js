import { hashSHA256 } from "@signumjs/crypto";
import { hexToTransactionId } from "./convertTransactionId";
function generateFakeTx(text) {
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
  };
}
// @ts-ignore
export const DryLedger = {
  message: {
    sendMessage: ({ message }) => Promise.resolve(generateFakeTx(message)),
    sendEncryptedMessage: ({ message }) =>
      Promise.resolve(generateFakeTx(message)),
  },
};
