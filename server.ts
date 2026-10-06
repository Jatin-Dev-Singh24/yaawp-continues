import { existsSync } from "node:fs";
import { resolve } from "node:path";

export { default } from "./src/server";

process.env.PORT = process.env.PORT || "3000";
process.env.NITRO_PORT = process.env.PORT;
process.env.NITRO_HOST = process.env.NITRO_HOST || "0.0.0.0";

const builtEntry = resolve(process.cwd(), ".output/server/index.mjs");

if (existsSync(builtEntry)) {
  await import(builtEntry);
}

