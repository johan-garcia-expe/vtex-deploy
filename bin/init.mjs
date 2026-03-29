#!/usr/bin/env node
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const createRequireAlias = createRequire(import.meta.url);

const initPath = join(__dirname, "../src/init.ts");
const distPath = join(__dirname, "../dist/init.js");

if (existsSync(distPath)) {
  await import(distPath);
} else {
  const { register } = await import("tsx/esm");
  register();
  await import(initPath);
}
