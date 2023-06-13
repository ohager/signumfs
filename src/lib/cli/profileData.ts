import {
  pathExists,
  remove,
  writeFile,
  readFile,
  ensureFileSync,
} from "fs-extra";
import { deriveKey } from "./deriveKey";
import {
  decryptAES,
  encryptAES,
  generateMasterKeys,
  Keys,
} from "@signumjs/crypto";
import { Address } from "@signumjs/core";
import envPaths from "env-paths";

const userDataPath = envPaths("signumfs").data;
ensureFileSync(userDataPath);

export class ProfileData {
  public seed = "";
  public node = "";
  public address = "";

  static async reset() {
    await remove(userDataPath);
  }

  async save(pin: string) {
    const { salt, derivedKey } = deriveKey(pin);

    const data = JSON.stringify({
      seed: this.seed,
      network: this.node,
      address: this.address,
    });

    await writeFile(userDataPath, salt + "." + encryptAES(data, derivedKey), {
      encoding: "utf-8",
    });
  }

  static async exists(): Promise<boolean> {
    return pathExists(userDataPath);
  }

  async load(pin: string) {
    const fileData = await readFile(userDataPath, { encoding: "utf-8" });
    const [salt, cipher] = fileData.split(".");
    const { derivedKey } = deriveKey(pin, salt);
    const stringifiedJson = decryptAES(cipher, derivedKey);
    const json = JSON.parse(stringifiedJson);
    this.seed = json.seed;
    this.node = json.network;
    this.address = json.address;
  }

  static async load(pin: string): Promise<ProfileData> {
    const userData = new ProfileData();
    await userData.load(pin);
    return userData;
  }

  getKeys(): Keys {
    return generateMasterKeys(this.seed);
  }

  getAccountId(): string {
    const { publicKey } = this.getKeys();
    return Address.fromPublicKey(publicKey).getNumericId();
  }

  getAddress(): string {
    const { publicKey } = this.getKeys();
    return Address.fromPublicKey(publicKey).getReedSolomonAddress(false);
  }

  print(): void {
    console.table({
      Network: this.node,
      Account: this.address,
    });
  }
}
