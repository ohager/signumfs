import { SignumFS } from "../signumfs";
import * as path from "path";
import { DryLedger } from "../lib/dryLedger";
import { Amount } from "@signumjs/util";

describe("SignumFS", () => {
  describe("uploadFile", () => {
    it("should run a dry run - file: testfile1.txt", async () => {
      const signumfs = new SignumFS({
        dryRun: true,
        chunksPerBlock: 256,
        seed: "seed",
        nodeHost: "http://localhost:6876",
      });

      const sendMessage = jest.spyOn(DryLedger.message, "sendMessage");

      const tx = await signumfs.uploadFile(
        path.join(__dirname, "./data", "testfile1.txt")
      );
      expect(sendMessage).toBeCalledTimes(3);
      expect(tx.feePlanck).toEqual(Amount.fromSigna(0.03).getPlanck());
      expect(tx.metadata).toEqual({
        vs: 1,
        tp: "OTH",
        nm: "testfile1.txt",
        xapp: "SignumFS",
        xsize: 1104,
        xchunks: 2,
        xid: "5938536618993977709",
        xsha512:
          "b30dbcf148b135ae85356814e1421777dece6f5b4140071660867fe803f73d3cf7def628aa6949a8f5a69d07d1df26d11ebba58aa5a7d21821bc1e9c746155ff",
      });
    });
    it("should run a dry run - file: test.ico", async () => {
      const signumfs = new SignumFS({
        dryRun: true,
        chunksPerBlock: 256,
        seed: "seed",
        nodeHost: "http://localhost:6876",
      });

      const sendMessage = jest.spyOn(DryLedger.message, "sendMessage");

      const tx = await signumfs.uploadFile(
        path.join(__dirname, "./data", "test.ico")
      );
      expect(sendMessage).toBeCalledTimes(17);
      expect(tx.feePlanck).toEqual(Amount.fromSigna(0.17).getPlanck());
      expect(tx.metadata).toEqual({
        vs: 1,
        tp: "OTH",
        nm: "test.ico",
        xapp: "SignumFS",
        xsize: 15406,
        xchunks: 16,
        xid: "17461702272643743089",
        xsha512:
          "3929fee5d27a7e9693b1f0a60159b4aa5b9414e3a57415319457dfe13aa90e224fb03e3b5d863484c309dd6275b637d6a99bd87580574e7c5549124415dfb6c9",
      });
    });
  });
});
