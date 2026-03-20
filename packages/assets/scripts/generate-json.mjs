import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ASSET_LIST_JSON, TOKEN_LIST_JSON } from "../dist/lists.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = resolve(__dirname, "../dist");

mkdirSync(distDir, { recursive: true });

writeFileSync(
  resolve(distDir, "tokens.json"),
  `${JSON.stringify(TOKEN_LIST_JSON, null, 2)}\n`,
  "utf-8"
);

writeFileSync(
  resolve(distDir, "assets.json"),
  `${JSON.stringify(ASSET_LIST_JSON, null, 2)}\n`,
  "utf-8"
);

console.log("Generated dist/tokens.json and dist/assets.json");
