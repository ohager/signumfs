import {
  hexToTransactionId,
  transactionIdToHex,
} from "../lib/core/convertTransactionId";

describe("convertTransactionId", () => {
  describe("transactionIdToHex", () => {
    it("converts as expected", async () => {
      expect(transactionIdToHex("8759667087583030717")).toEqual(
        "799096ce32112dbd"
      );
      expect(transactionIdToHex("10")).toEqual("000000000000000a");
      expect(transactionIdToHex("0")).toEqual("0000000000000000");
    });
  });
  describe("hexToTransactionId", () => {
    it("converts as expected", async () => {
      expect(hexToTransactionId("799096ce32112dbd")).toEqual(
        "8759667087583030717"
      );
      expect(hexToTransactionId("000000000000000a")).toEqual("10");
      expect(hexToTransactionId("0000000000000000")).toEqual("0");
    });
  });
});
