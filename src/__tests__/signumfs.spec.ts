import { expect, jest } from "@jest/globals";
import { SignumFS } from "../signumfs";
import * as path from "path";
import { DryLedger } from "../lib/dryLedger";
import { Amount } from "@signumjs/util";
import { unlink, stat } from "fs/promises";

declare function fail(error?: any): never;
describe("SignumFS", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  describe("uploadFile", () => {
    it("should run a dry run - file: testfile1.txt", async () => {
      const signumfs = new SignumFS({
        dryRun: true,
        chunksPerBlock: 256,
        seed: "seed",
        nodeHost: "http://localhost:6876",
      });

      const sendMessage = jest.spyOn(DryLedger.message, "sendMessage");

      const tx = await signumfs.uploadFile({
        filePath: path.join(__dirname, "./data", "testfile1.txt"),
      });
      expect(sendMessage).toBeCalledTimes(3);
      expect(tx.feePlanck).toEqual(Amount.fromSigna(0.03).getPlanck());
      expect(tx.metadata).toEqual({
        vs: 1,
        tp: "FIL",
        nm: "testfile1.txt",
        xapp: "SignumFS",
        xsize: 1104,
        xchunks: 2,
        xid: "5938536618993977709",
        xsha512:
          "b30dbcf148b135ae85356814e1421777dece6f5b4140071660867fe803f73d3cf7def628aa6949a8f5a69d07d1df26d11ebba58aa5a7d21821bc1e9c746155ff",
      });
    });
    it("should run a dry run - file: testfile1.txt - compression", async () => {
      const signumfs = new SignumFS({
        dryRun: true,
        chunksPerBlock: 256,
        seed: "seed",
        nodeHost: "http://localhost:6876",
      });

      const sendMessage = jest.spyOn(DryLedger.message, "sendMessage");

      const tx = await signumfs.uploadFile({
        filePath: path.join(__dirname, "./data", "testfile1.txt"),
        shouldCompress: true,
      });
      expect(sendMessage).toBeCalledTimes(2);
      expect(tx.feePlanck).toEqual(Amount.fromSigna(0.02).getPlanck());
      expect(tx.metadata).toEqual({
        vs: 1,
        tp: "FIL",
        nm: "testfile1.txt",
        xapp: "SignumFS",
        xsize: 1104,
        xchunks: 1,
        xcmp: "br",
        xcms: 373,
        xid: "2527636466048431471",
        xsha512:
          "a01b565cb28dd7257a93b2d31994821ab0f39e35dcaeab5c4d2d591ab52aa76980f783ab315a8cb94b66fdb4fc26fa3a8e90c1cbd814e2335ffb36c61003700d",
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

      const tx = await signumfs.uploadFile({
        filePath: path.join(__dirname, "./data", "test.ico"),
      });
      expect(sendMessage).toBeCalledTimes(17);
      expect(tx.feePlanck).toEqual(Amount.fromSigna(0.17).getPlanck());
      expect(tx.metadata).toEqual({
        vs: 1,
        tp: "FIL",
        nm: "test.ico",
        xapp: "SignumFS",
        xsize: 15406,
        xchunks: 16,
        xid: "17461702272643743089",
        xsha512:
          "3929fee5d27a7e9693b1f0a60159b4aa5b9414e3a57415319457dfe13aa90e224fb03e3b5d863484c309dd6275b637d6a99bd87580574e7c5549124415dfb6c9",
      });
    });
    it("should throw on dry run - file: empty.txt", async () => {
      const signumfs = new SignumFS({
        dryRun: true,
        chunksPerBlock: 256,
        seed: "seed",
        nodeHost: "http://localhost:6876",
      });

      try {
        const tx = await signumfs.uploadFile({
          filePath: path.join(__dirname, "./data", "empty.txt"),
        });
        fail("Should throw");
      } catch (e: any) {
        expect(e.message).toMatch("File is empty");
      }
    });
    it("should throw on dry run no file, but dir", async () => {
      const signumfs = new SignumFS({
        dryRun: true,
        chunksPerBlock: 256,
        seed: "seed",
        nodeHost: "http://localhost:6876",
      });

      try {
        const tx = await signumfs.uploadFile({
          filePath: path.join(__dirname, "./data"),
        });
        fail("Should throw");
      } catch (e: any) {
        expect(e.message).toMatch("Not a file");
      }
    });
  });
  describe("downloadFile", () => {
    it("should run a dry run - file: testfile1.txt", async () => {
      const signumfs = new SignumFS({
        dryRun: true,
        chunksPerBlock: 256,
        seed: "seed",
        nodeHost: "http://localhost:6876",
      });

      const filePath = path.join(__dirname, "testdownload.txt");
      const result = await signumfs.downloadFile({
        metadataTransactionId: "14285717817138105801",
        filePath,
      });

      const info = await stat(filePath);
      expect(info.isFile()).toBeTruthy();
      await unlink(filePath);
      expect(result).toEqual({
        nm: "testfile1.txt",
        tp: "OTH",
        vs: 1,
        xapp: "SignumFS",
        xchunks: 2,
        xid: "15771118143703187517",
        xsha512:
          "b30dbcf148b135ae85356814e1421777dece6f5b4140071660867fe803f73d3cf7def628aa6949a8f5a69d07d1df26d11ebba58aa5a7d21821bc1e9c746155ff",
        xsize: 1104,
      });
    });
  });
});
