import { ProfileData } from "@lib/cli/profileData";
import { SignumFS } from "../signumfs";
import ora from "ora";
import { Address, Ledger } from "@signumjs/core";
import { DescriptorDataClient } from "@signumjs/standards";

async function resolveAccountId(acc: string, ledger: Ledger) {
  try {
    const address = Address.create(acc);
    return Promise.resolve(address.getNumericId());
  } catch (e) {}
  const data = new DescriptorDataClient(ledger);
  const { account } = await data.getFromAlias(acc);
  if (!account) {
    throw new Error(`Cannot resolve alias '${acc}'`);
  }
  return account;
}

function shortenString(
  str: string,
  trimOffset: number = 20,
  delimiter = "…"
): string {
  const offset = trimOffset / 2;
  return str.length > trimOffset
    ? str.substring(0, offset) + delimiter + str.substring(str.length - offset)
    : str;
}
export async function ls(opts: any, profile: ProfileData) {
  const fs = new SignumFS({
    dryRun: opts.try,
    seed: profile.seed,
    nodeHost: profile.node,
  });
  const spinner = ora(
    `Fetching file data for account [${opts.account}]...`
  ).start();
  try {
    const accountId = await resolveAccountId(
      opts.account || "S-" + profile.address,
      fs.getLedger()
    );
    const fileData = await fs.listFiles(accountId);
    const records = Object.entries(fileData);
    spinner.succeed(`Fetched ${records.length} file records`);
    const tableData = records.map(([fileId, meta]) => {
      const size = meta.xcms || meta.xsize;
      const fee = Number(((size / 176) * 0.01 + 0.02).toFixed(2));
      const compressed = meta.xcms
        ? `${meta.xcmp} (${((meta.xcms / meta.xsize) * 100).toFixed(1)}%)`
        : "-";
      return {
        fileId,
        name: meta.nm,
        size,
        fee,
        chunks: meta.xchunks,
        compressed,
        sha512: shortenString(meta.xsha512),
      };
    });
    console.table(tableData);
  } catch (e: any) {
    spinner.fail(e.message);
  }
}
