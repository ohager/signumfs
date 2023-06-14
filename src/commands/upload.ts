import { ProfileData } from "@lib/cli/profileData";
import { SignumFS } from "../signumfs";
import ora from "ora";
import * as path from "path";
import { cwd } from "process";
import { Amount } from "@signumjs/util";

export async function upload(opts: any, profile: ProfileData) {
  if (opts.try) {
    console.info("=================== TRIAL RUN ====================");
    console.info("Nothing will be uploaded");
    console.info("================================================\n");
  }
  const fs = new SignumFS({
    dryRun: opts.try,
    seed: profile.seed,
    nodeHost: profile.node,
  });

  const shouldCompress = Boolean(opts.compress);
  let filePath = path.isAbsolute(opts.file)
    ? opts.file
    : path.join(cwd(), opts.file);
  const spinner = ora(`Uploading file ${opts.file}...`).start();
  fs.on("progress", (args) => {
    spinner.text = `Uploading: Chunk ${args.chunkCount} - ${args.uploaded} bytes`;
  });
  try {
    const { feePlanck, transaction, metadata } = await fs.uploadFile({
      filePath,
      shouldCompress,
    });
    spinner.succeed("Uploaded Successfully");
    console.table({
      fee: Amount.fromPlanck(feePlanck).getSigna(),
      // @ts-ignore
      fileId: transaction.transaction,
      chunks: metadata.xchunks,
      uploaded: `${((metadata.xcms || metadata.xsize) / 1024).toFixed(2)} KiB`,
    });
  } catch (e: any) {
    spinner.fail(e.message);
  }
}
