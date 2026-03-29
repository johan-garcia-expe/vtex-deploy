import * as p from "@clack/prompts";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

async function main() {
  p.intro("vtex-deploy init — Configuración inicial del proyecto");

  const destPath = process.cwd();

  // Verificar si ya existe configuración
  const configPath = join(destPath, ".vtex-deploy.yaml");
  if (existsSync(configPath)) {
    const overwrite = await p.confirm({
      message: ".vtex-deploy.yaml ya existe. ¿Deseas sobreescribirlo?",
    });
    if (p.isCancel(overwrite) || !overwrite) { p.cancel("Cancelado."); process.exit(0); }
  }

  // Leer manifest.json
  const manifestPath = join(destPath, "manifest.json");
  if (!existsSync(manifestPath)) {
    p.log.error("No se encontró manifest.json en el directorio actual. Ejecuta este comando en la raíz de un proyecto VTEX IO.");
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  const vendorProd: string = manifest.vendor;
  p.log.info(`vendor_prod detectado: ${vendorProd}`);

  // Vendor QA
  const vendorQa = await p.text({
    message: "¿Cuál es el vendor de QA?",
    placeholder: `${vendorProd}qa`,
    validate: (val) => val.trim() ? undefined : "El vendor de QA es requerido.",
  });
  if (p.isCancel(vendorQa)) { p.cancel("Cancelado."); process.exit(0); }

  // Detectar dependencias con prefijo vendor_prod
  const allDeps = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.peerDependencies ?? {}),
  };
  const vendorDeps = Object.keys(allDeps).filter((dep) => dep.startsWith(`${vendorProd}.`));

  let depsToSwitch: string[] = [];
  if (vendorDeps.length === 0) {
    p.log.warn(`No se encontraron dependencias con prefijo "${vendorProd}" en manifest.json.`);
  } else {
    const selected = await p.multiselect({
      message: "¿Cuáles dependencias deben cambiar al deployar a QA?",
      options: vendorDeps.map((dep) => ({ value: dep, label: dep })),
      initialValues: vendorDeps,
    });
    if (p.isCancel(selected)) { p.cancel("Cancelado."); process.exit(0); }
    depsToSwitch = selected as string[];
  }

  // Detectar ramas git
  let branches: string[] = [];
  try {
    const output = execSync("git branch -a", { cwd: destPath }).toString();
    branches = output
      .split("\n")
      .map((b) => b.replace(/^\*?\s+/, "").replace(/^remotes\/origin\//, "").trim())
      .filter((b) => b && !b.includes("HEAD") && !b.includes("->"))
      .filter((b, i, arr) => arr.indexOf(b) === i)
      .sort();
  } catch {
    p.log.warn("No se pudo detectar ramas git. Asegúrate de estar en un repositorio git.");
  }

  if (branches.length === 0) {
    p.log.error("No se encontraron ramas. Verifica que el proyecto tiene un repositorio git inicializado.");
    process.exit(1);
  }

  const branchOptions = branches.map((b) => ({ value: b, label: b }));
  const findDefault = (...names: string[]) =>
    names.find((n) => branches.includes(n)) ?? branches[0];

  // Mapeo de ramas
  const branchProd = await p.select({
    message: "Rama de Producción:",
    options: branchOptions,
    initialValue: findDefault("main", "master"),
  });
  if (p.isCancel(branchProd)) { p.cancel("Cancelado."); process.exit(0); }

  const branchQa = await p.select({
    message: "Rama de QA:",
    options: branchOptions,
    initialValue: findDefault("qa", "staging"),
  });
  if (p.isCancel(branchQa)) { p.cancel("Cancelado."); process.exit(0); }

  const branchDevelop = await p.select({
    message: "Rama de desarrollo:",
    options: branchOptions,
    initialValue: findDefault("develop", "dev", "development"),
  });
  if (p.isCancel(branchDevelop)) { p.cancel("Cancelado."); process.exit(0); }

  // Construir YAML
  const depsLines = depsToSwitch.map((d) => `  - ${d}`).join("\n");
  const yaml = [
    `vendor_prod: ${vendorProd}`,
    `vendor_qa: ${(vendorQa as string).trim()}`,
    ``,
    `dependencies_to_switch:`,
    depsLines || `  []`,
    ``,
    `branches:`,
    `  prod: ${branchProd}`,
    `  qa: ${branchQa}`,
    `  develop: ${branchDevelop}`,
    ``,
  ].join("\n");

  // Preview y confirmación
  p.log.step("Configuración a guardar en .vtex-deploy.yaml:");
  p.log.message(yaml);

  const confirmed = await p.confirm({ message: "¿Guardar configuración?" });
  if (p.isCancel(confirmed) || !confirmed) { p.cancel("Cancelado."); process.exit(0); }

  writeFileSync(configPath, yaml, "utf-8");

  p.outro(".vtex-deploy.yaml creado correctamente. Ya puedes pedir al agente que ejecute un deploy.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
