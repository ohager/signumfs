import { promptProfile } from "./prompt";
import { hasProfileData } from "./hasProfileData";
import { promptConfirm } from "@lib/cli/promptConfirm";
import { ProfileData } from "@lib/cli/profileData";
import { generateMasterKeys } from "@signumjs/crypto";
import { Address } from "@signumjs/core";
import { showDisclaimer } from "@lib/cli/showDisclaimer";

export const init = async () => {
  showDisclaimer();
  const accept = await promptConfirm("I understand and agree!");
  if (!accept) {
    console.info("Cancelled by User");
    return;
  }

  const hasProfile = await hasProfileData();
  if (hasProfile) {
    const overwrite = await promptConfirm(
      "Do you want to overwrite the existing profile?"
    );
    if (!overwrite) {
      console.info("Cancelled by User");
      return;
    }
  }

  const { seed, node, pin } = await promptProfile();

  const keys = generateMasterKeys(seed);

  const profileData = new ProfileData();
  profileData.seed = seed;
  profileData.node = node;
  profileData.address = Address.fromPublicKey(
    keys.publicKey
  ).getReedSolomonAddress(false);

  profileData.print();
  const confirmed = await promptConfirm("Is this correct?");
  if (!confirmed) {
    console.info("Cancelled by User");
    return;
  }
  await profileData.save(pin);

  console.info("Profile successfully initialized");
};
