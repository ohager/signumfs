import { Amount } from "@signumjs/util";

export function calculateTransactionFeePerMessage(
  message: string,
  isText: boolean
) {
  const accountableLength = isText ? message.length : message.length / 2;
  const estimatedFeeFactor = Math.max(1, Math.ceil(accountableLength / 176));
  return Amount.fromSigna(0.01).multiply(estimatedFeeFactor);
}

export function calculateTransactionFee(length: number) {
  const estimatedFeeFactor = Math.max(1, Math.ceil(length / 176));
  return Amount.fromSigna(0.01).multiply(estimatedFeeFactor);
}
