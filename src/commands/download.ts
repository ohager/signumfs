import { ProfileData } from "@lib/cli/profileData";
import { SignumFS } from "../signumfs";
import path from "path";
import { cwd } from "process";
import ora from "ora";
export async function download(opts: any, profile: ProfileData) {
  const fs = new SignumFS({
    dryRun: false,
    seed: profile.seed,
    nodeHost: profile.node,
  });
  let filePath;
  if (opts.outfile) {
    filePath = path.isAbsolute(opts.outfile)
      ? opts.outfile
      : path.join(cwd(), opts.outfile);
  }
  const spinner = ora(`Downloading file ${opts.fileId}...`).start();
  fs.on("progress", (args) => {
    spinner.text = `Downloading: Chunk ${args.chunk}/${args.chunks} - ${args.downloaded}/${args.size} bytes`;
  });
  try {
    const metadata = await fs.downloadFile({
      filePath,
      metadataTransactionId: opts.fileId,
    });
    spinner.succeed("Downloaded Successfully");
    console.info("File saved under:", filePath || metadata.nm);
  } catch (e: any) {
    spinner.fail(e.message);
  }
}
