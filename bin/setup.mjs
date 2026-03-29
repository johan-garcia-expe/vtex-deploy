#!/usr/bin/env node
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Ejecutar el instalador via tsx (desarrollo) o dist/ (producción)
const installerPath = join(__dirname, "../src/install.ts");
const distPath = join(__dirname, "../dist/install.js");

import { existsSync } from "fs";

if (existsSync(distPath)) {
  await import(distPath);
} else {
  // En desarrollo: usar tsx
  const { register } = await import("tsx/esm");
  register();
  await import(installerPath);
}
