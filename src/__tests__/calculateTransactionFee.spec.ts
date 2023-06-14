import { calculateTransactionFeePerMessage } from "../lib/core/calculateTransactionFeePerMessage";

function range(size: number, char: string = "A") {
  return Array.from({ length: size }, () => char).join("");
}

const Base = 176;
describe("calculateTransactionFee", () => {
  it("calculates as expected - non-binary", async () => {
    expect(
      calculateTransactionFeePerMessage("Some text", true).getSigna()
    ).toEqual("0.01");
    expect(
      calculateTransactionFeePerMessage(range(Base), true).getSigna()
    ).toEqual("0.01");
    expect(
      calculateTransactionFeePerMessage(range(Base + 1), true).getSigna()
    ).toEqual("0.02");
    expect(
      calculateTransactionFeePerMessage(range(Base * 2), true).getSigna()
    ).toEqual("0.02");
    expect(
      calculateTransactionFeePerMessage(range(Base * 3), true).getSigna()
    ).toEqual("0.03");
    expect(
      calculateTransactionFeePerMessage(range(Base * 4), true).getSigna()
    ).toEqual("0.04");
    expect(
      calculateTransactionFeePerMessage(range(Base * 5), true).getSigna()
    ).toEqual("0.05");
    expect(
      calculateTransactionFeePerMessage(range(Base * 6), true).getSigna()
    ).toEqual("0.06");
  });
  it("calculates as expected - binary", async () => {
    expect(
      calculateTransactionFeePerMessage(range(Base), false).getSigna()
    ).toEqual("0.01");
    expect(
      calculateTransactionFeePerMessage(range(Base * 2), false).getSigna()
    ).toEqual("0.01");
    expect(
      calculateTransactionFeePerMessage(range(Base * 2) + 1, false).getSigna()
    ).toEqual("0.02");
    expect(
      calculateTransactionFeePerMessage(range(Base * 3), false).getSigna()
    ).toEqual("0.02");
    expect(
      calculateTransactionFeePerMessage(range(Base * 4), false).getSigna()
    ).toEqual("0.02");
    expect(
      calculateTransactionFeePerMessage(range(Base * 5), false).getSigna()
    ).toEqual("0.03");
    expect(
      calculateTransactionFeePerMessage(range(Base * 6), false).getSigna()
    ).toEqual("0.03");
    expect(
      calculateTransactionFeePerMessage(range(Base * 7), false).getSigna()
    ).toEqual("0.04");
    expect(
      calculateTransactionFeePerMessage(range(Base * 8), false).getSigna()
    ).toEqual("0.04");
    expect(
      calculateTransactionFeePerMessage(range(1060), false).getSigna()
    ).toEqual("0.04");
    expect(
      calculateTransactionFeePerMessage(range(2000), false).getSigna()
    ).toEqual("0.06");
  });
});
