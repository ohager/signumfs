import { program } from "commander";
import inquirer from "inquirer";
import { show, init, reset } from "@commands/profile";
import { ProfileData } from "@lib/cli/profileData";

export { SignumFS } from "./signumfs";
import { upload, ls, download } from "./commands";

const version = process.env.npm_package_version || "";
interface ActionArgs {
  opts: any;
  context?: any;
  action: (...args: any[]) => void | Promise<void>;
}

async function promptPin() {
  return inquirer.prompt<{ pin: string }>([
    {
      type: "password",
      message: "Enter your PIN",
      name: "pin",
    },
  ]);
}

async function startAction(args: ActionArgs) {
  const { action, opts, context } = args;
  return action(opts, context);
}

async function withProfile(fn: (profile: ProfileData) => void | Promise<void>) {
  try {
    const { pin } = await promptPin();
    const profileData = await ProfileData.load(pin);
    return fn(profileData);
  } catch (e: any) {
    console.warn(
      "Could not load the profile. Is your PIN correct? Did you initialize your Profile with [profile init]?"
    );
  }
}

const app = program.version(version).description(`
            @@@@@@@@  @@@@@@@           
         @@@@@    @@@@@    @@@@@        
           @@@  @@@  @@@ @@@@@          
    @@@      @@@@@     @@@@       @@@   
  @@@@@@@@ &@@@  @@@@@@@@ @@@@  @@@@@@@ 
 @@@    @@@@       @@@      @@@@@    @@@
 @@@  @@@ *@@@@           @@@  @@@  @@@@
   @@@@@     @@@         @@@     @@@@@  
 @@@@  @@@  @@@           @@@@  @@@  @@@
 @@@    @@@@@      @@@       @@@@    @@@
  @@@@@@@  @@@  @@@@@@@@  @@@  @@@@@@@@ 
    @@@       @@@@     @@@@@      @@@   
           @@@@  @@@  @@@  @@@          
         @@@@@    @@@@@    @@@@@        
            @@@@@@@  @@@@@@@@    
 
     SignumFS - Blockchain File Storage
      
  Author: ohager
  Version: ${version}
  `);

app
  .command("upload")
  .description("Upload a file")
  .option(
    "-t, --try",
    "Runs without creating anything on chain. Good for testing purposes"
  )
  .option("-f, --file <string>", "Filename to upload")
  .option("-x, --compress", "Compress data before upload")
  .action((opts) =>
    withProfile((profileData) =>
      startAction({
        opts,
        context: profileData,
        action: upload,
      })
    )
  );

app
  .command("download")
  .description("Download a file")
  .option("-f, --fileId <string>", "File Chain Id")
  .action((opts) =>
    withProfile((profileData) =>
      startAction({
        opts,
        context: profileData,
        action: download,
      })
    )
  );

app
  .command("ls")
  .alias("list")
  .alias("dir")
  .option(
    "-a, --account <string>",
    "Account Id, Address, or alias. If not given your own profile account is considered",
    ""
  )
  .description("List all uploaded files")
  .action((opts) =>
    withProfile((profileData) =>
      startAction({
        opts,
        context: profileData,
        action: ls,
      })
    )
  );

const profile = program.command("profile");

profile
  .command("show")
  .description("Shows the current Profile")
  .action((opts) =>
    withProfile((profileData) =>
      startAction({
        opts,
        context: profileData,
        action: show,
      })
    )
  );

profile
  .command("init")
  .alias("create")
  .description("Configures a Profile")
  .action((opts) =>
    startAction({
      opts,
      action: init,
    })
  );

profile
  .command("reset")
  .alias("remove")
  .description("Resets the Profile")
  .action((opts) =>
    startAction({
      opts,
      action: reset,
    })
  );

(async () => {
  try {
    await app.parseAsync(process.argv);
  } catch (e: any) {
    console.error(
      "❌ Damn, something failed - Check the log files for more details"
    );
    process.exit(-1);
  }
})();
