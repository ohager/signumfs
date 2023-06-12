import { calculateTransactionFee } from "../lib/calculateTransactionFee";

function range(size: number, char: string = "A") {
  return Array.from({ length: size }, () => char).join("");
}
describe("calculateTransactionFee", () => {
  it("calculates as expected", async () => {
    expect(calculateTransactionFee("Some text").getSigna()).toEqual("0.01");
    expect(calculateTransactionFee(range(185)).getSigna()).toEqual("0.02");
    expect(calculateTransactionFee(range(185 * 2)).getSigna()).toEqual("0.03");
    expect(calculateTransactionFee(range(185 * 3)).getSigna()).toEqual("0.04");
    expect(calculateTransactionFee(range(185 * 4)).getSigna()).toEqual("0.05");
    expect(calculateTransactionFee(range(185 * 5)).getSigna()).toEqual("0.06");
  });
});
