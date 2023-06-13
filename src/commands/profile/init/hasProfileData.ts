import ora, { Ora } from "ora";
import { ProfileData } from "@lib/cli/profileData";

export const hasProfileData = async (): Promise<boolean> => {
  let spinner: Ora | null = null;

  try {
    spinner = ora("Checking existing profile").start();
    const exists = await ProfileData.exists();
    if (exists) {
      spinner.warn(`A profile was already initialized`);
      console.info("Use [profile show] to inspect the current profile");
      return true;
    } else {
      spinner.succeed("No profile found");
      return false;
    }
  } catch (e: any) {
    spinner?.fail(e.message);
    throw e;
  }
};
