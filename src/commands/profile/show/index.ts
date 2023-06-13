import { ProfileData } from "@lib/cli/profileData";

export const show = async (opts: any, profile: ProfileData) => {
  try {
    console.info("Current Profile");
    profile.print();
  } catch (e: any) {
    console.info("No Profile available");
    console.info(
      "If you have a profile, use the command 'profile init' to set up your profile"
    );
    console.info(
      "If you don't have a profile yet, create it on the NFT portal"
    );
  }
};
