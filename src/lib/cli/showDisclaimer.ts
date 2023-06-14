import { marked } from "marked";
// @ts-ignore
import ConsoleRenderer from "marked-terminal";
import { readFileSync } from "fs-extra";
import { join } from "path";

marked.setOptions({
  renderer: new ConsoleRenderer(),
  mangle: false,
  headerIds: false,
});

export function showDisclaimer() {
  const disclaimer = readFileSync(
    join(__dirname, "../../../DISCLAIMER.md"),
    "utf-8"
  );
  console.info(marked(disclaimer));
}
