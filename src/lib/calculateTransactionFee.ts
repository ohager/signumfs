import { Amount } from "@signumjs/util";

export function calculateTransactionFee(message: string) {
  const estimatedFeeFactor = Math.max(1, Math.ceil(message.length / 184));
  return Amount.fromSigna(0.01).multiply(estimatedFeeFactor);
}
