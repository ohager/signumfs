import { Ledger, Transaction, TransactionId } from "@signumjs/core";
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
  // @ts-ignore
  network: {
    getMiningInfo: () =>
      Promise.resolve({
        height: "556647",
        generationSignature:
          "24418f1f3fe6f58d1c86931338061e14d11ab84c01563508eed12333bee362eb",
        baseTarget: "32788060",
        averageCommitmentNQT: "16120578834432",
        lastBlockReward: "730",
        lastBlockRewardNQT: "73000000000",
        timestamp: "278933397",
        requestProcessingTime: 0,
      }),
  },
  // @ts-ignore
  transaction: {
    getTransaction: (transactionId) => {
      // @ts-ignore
      const tx = transactions[transactionId] as Transaction;
      if (tx) {
        return Promise.resolve(tx);
      }
      throw new Error("Tx not found");
    },
  },
};

// mock data

const transactions = {
  "14285717817138105801": {
    type: 1,
    subtype: 0,
    timestamp: 278863085,
    deadline: 24,
    senderPublicKey:
      "c213e4144ba84af94aae2458308fae1f0cb083870c8f3012eea58147f3b09d4a",
    recipient: "2402520554221019656",
    recipientRS: "TS-QAJA-QW5Y-SWVP-4RVP4",
    amountNQT: "0",
    feeNQT: "2000000",
    signature:
      "7ff543ef148a3718a5068a4b9185a76f40e36ce75add4e888f7c9e913356bd065113b3de322f315404ac84f7431d5edc09ccaeec3ff50f3c55bcfced34003cf9",
    signatureHash:
      "60d9075c4c6754a2d60a19e761c0f1bd956d63a4c6520a3b7bb70b7333eb9daa",
    fullHash:
      "c94dfc6baa1041c690c73457a4373ab9e9389b1c1aec2dc602e927355ed60977",
    transaction: "14285717817138105801",
    attachment: {
      "version.Message": 1,
      message:
        '{"vs":1,"tp":"OTH","nm":"testfile1.txt","xapp":"SignumFS","xsize":1104,"xchunks":2,"xid":"15771118143703187517","xsha512":"b30dbcf148b135ae85356814e1421777dece6f5b4140071660867fe803f73d3cf7def628aa6949a8f5a69d07d1df26d11ebba58aa5a7d21821bc1e9c746155ff"}',
      messageIsText: true,
    },
    attachmentBytes:
      "01fd0000807b227673223a312c227470223a224f5448222c226e6d223a227465737466696c65312e747874222c2278617070223a225369676e756d4653222c227873697a65223a313130342c22786368756e6b73223a322c22786964223a223135373731313138313433373033313837353137222c2278736861353132223a226233306462636631343862313335616538353335363831346531343231373737646563653666356234313430303731363630383637666538303366373364336366376465663632386161363934396138663561363964303764316466323664313165626261353861613561376432313832316263316539633734363135356666227d",
    sender: "2402520554221019656",
    senderRS: "TS-QAJA-QW5Y-SWVP-4RVP4",
    height: 556354,
    version: 2,
    ecBlockId: "746056454038088881",
    ecBlockHeight: 556345,
    cashBackId: "8952122635653861124",
    block: "895067621500741235",
    confirmations: 290,
    blockTimestamp: 278863237,
    requestProcessingTime: 10,
  },
  "15771118143703187517": {
    type: 1,
    subtype: 0,
    timestamp: 278863085,
    deadline: 24,
    senderPublicKey:
      "c213e4144ba84af94aae2458308fae1f0cb083870c8f3012eea58147f3b09d4a",
    recipient: "2402520554221019656",
    recipientRS: "TS-QAJA-QW5Y-SWVP-4RVP4",
    amountNQT: "0",
    feeNQT: "1000000",
    signature:
      "e3ea11fc5bda668d8be4f1c501d7b560ddc761aec8262f3e3ce1e30bc63e4f0daabb7bd21bab2f72200feaf2fb4439bf270e2d498366b46d0278fb52cd7a7692",
    signatureHash:
      "ea39fef330ced3460a1ce78774c0e76e742d33a83c213cf3639065322bbc270f",
    fullHash:
      "3d80258a6444dedaf8e49d45f5d204a6db42717f25f9617a4f47915c0b5f351b",
    transaction: "15771118143703187517",
    attachment: {
      "version.Message": 1,
      message:
        "eb787132cdc90519617829204e554c4c2c0d0a095b73796e635d205b696e745d204e554c4c2c0d0a095b6d6f64446174655d205b6e766172636861725d286d617829204e554c4c0d0a29204f4e205b5052494d4152595d2054455854494d4147455f4f4e205b5052494d4152595d0d0a0d0a474f0d0a0d0a",
      messageIsText: false,
    },
    attachmentBytes:
      "0178000000eb787132cdc90519617829204e554c4c2c0d0a095b73796e635d205b696e745d204e554c4c2c0d0a095b6d6f64446174655d205b6e766172636861725d286d617829204e554c4c0d0a29204f4e205b5052494d4152595d2054455854494d4147455f4f4e205b5052494d4152595d0d0a0d0a474f0d0a0d0a",
    sender: "2402520554221019656",
    senderRS: "TS-QAJA-QW5Y-SWVP-4RVP4",
    height: 556354,
    version: 2,
    ecBlockId: "746056454038088881",
    ecBlockHeight: 556345,
    cashBackId: "8952122635653861124",
    block: "895067621500741235",
    confirmations: 293,
    blockTimestamp: 278863237,
    requestProcessingTime: 4,
  },
  "16967436059133150489": {
    type: 1,
    subtype: 0,
    timestamp: 278863085,
    deadline: 24,
    senderPublicKey:
      "c213e4144ba84af94aae2458308fae1f0cb083870c8f3012eea58147f3b09d4a",
    recipient: "2402520554221019656",
    recipientRS: "TS-QAJA-QW5Y-SWVP-4RVP4",
    amountNQT: "0",
    feeNQT: "6000000",
    signature:
      "f180279f221f8232b9c9e182c26a1d8ecb4a403e5bc06e8686a7b13326183201e756f309816ce8f8acffbfb165e611a5d02d91ff3a5ae994822d57b810e6250e",
    signatureHash:
      "0dece766a9b512c55f5d6b1c82aaf22c05a1cf991249fdd16ef0315e4b67b2f3",
    fullHash:
      "1905c9cd327178eb28c2d683d9e2824662e43264cfeb32f6ee172d4f1a857a9f",
    transaction: "16967436059133150489",
    attachment: {
      "version.Message": 1,
      message:
        "0000000000000000555345205b64625f6139393035635f6563727361315d0d0a474f0d0a0d0a2f2a2a2a2a2a2a204f626a6563743a20205461626c65205b64626f5d2e5b74626c496e7465726e616c5d2020202053637269707420446174653a20323032332f30352f32352031363a33373a3032202a2a2a2a2a2a2f0d0a53455420414e53495f4e554c4c53204f4e0d0a474f0d0a0d0a5345542051554f5445445f4944454e544946494552204f4e0d0a474f0d0a0d0a435245415445205441424c45205b64626f5d2e5b74626c496e7465726e616c5d280d0a095b69645d205b696e745d204944454e5449545928312c3129204e4f54204e554c4c2c0d0a095b646174655d205b6e766172636861725d286d617829204e554c4c2c0d0a095b73637261707065725d205b6e766172636861725d286d617829204e554c4c2c0d0a095b73756267726164655d205b6e766172636861725d286d617829204e554c4c2c0d0a095b77617374655d205b6e766172636861725d286d617829204e554c4c2c0d0a095b616c756d696e69756d5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b63617374416c756d5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b636f707065725d205b6e766172636861725d286d617829204e554c4c2c0d0a095b737461696e6c657373537465656c5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b737465656c5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b6261747465726965735d205b6e766172636861725d286d617829204e554c4c2c0d0a095b62726173735d205b6e766172636861725d286d617829204e554c4c2c0d0a095b706c61737469635d205b6e766172636861725d286d617829204e554c4c2c0d0a095b6361626c65735d205b6e766172636861725d286d617829204e554c4c2c0d0a095b616c756d696e69756d556e636c65616e5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b636f70706572556e636c65616e5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b737465656c556e636c65616e5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b706c6173746963556e636c65616e5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b6c6f7747726164655043425d205b6e766172636861725d286d617829204e554c4c2c0d0a095b6d656469756d47726164655043425d205b6e766172636861725d286d617829204e554c4c2c0d0a095b6869676847726164655043425d205b6e766172636861725d286d617829204e554c4c2c0d0a095b72616d5d205b6e766172636861725d286d",
      messageIsText: false,
    },
    attachmentBytes:
      "01e80300000000000000000000555345205b64625f6139393035635f6563727361315d0d0a474f0d0a0d0a2f2a2a2a2a2a2a204f626a6563743a20205461626c65205b64626f5d2e5b74626c496e7465726e616c5d2020202053637269707420446174653a20323032332f30352f32352031363a33373a3032202a2a2a2a2a2a2f0d0a53455420414e53495f4e554c4c53204f4e0d0a474f0d0a0d0a5345542051554f5445445f4944454e544946494552204f4e0d0a474f0d0a0d0a435245415445205441424c45205b64626f5d2e5b74626c496e7465726e616c5d280d0a095b69645d205b696e745d204944454e5449545928312c3129204e4f54204e554c4c2c0d0a095b646174655d205b6e766172636861725d286d617829204e554c4c2c0d0a095b73637261707065725d205b6e766172636861725d286d617829204e554c4c2c0d0a095b73756267726164655d205b6e766172636861725d286d617829204e554c4c2c0d0a095b77617374655d205b6e766172636861725d286d617829204e554c4c2c0d0a095b616c756d696e69756d5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b63617374416c756d5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b636f707065725d205b6e766172636861725d286d617829204e554c4c2c0d0a095b737461696e6c657373537465656c5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b737465656c5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b6261747465726965735d205b6e766172636861725d286d617829204e554c4c2c0d0a095b62726173735d205b6e766172636861725d286d617829204e554c4c2c0d0a095b706c61737469635d205b6e766172636861725d286d617829204e554c4c2c0d0a095b6361626c65735d205b6e766172636861725d286d617829204e554c4c2c0d0a095b616c756d696e69756d556e636c65616e5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b636f70706572556e636c65616e5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b737465656c556e636c65616e5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b706c6173746963556e636c65616e5d205b6e766172636861725d286d617829204e554c4c2c0d0a095b6c6f7747726164655043425d205b6e766172636861725d286d617829204e554c4c2c0d0a095b6d656469756d47726164655043425d205b6e766172636861725d286d617829204e554c4c2c0d0a095b6869676847726164655043425d205b6e766172636861725d286d617829204e554c4c2c0d0a095b72616d5d205b6e766172636861725d286d",
    sender: "2402520554221019656",
    senderRS: "TS-QAJA-QW5Y-SWVP-4RVP4",
    height: 556354,
    version: 2,
    ecBlockId: "746056454038088881",
    ecBlockHeight: 556345,
    cashBackId: "8952122635653861124",
    block: "895067621500741235",
    confirmations: 294,
    blockTimestamp: 278863237,
    requestProcessingTime: 7,
  },
};