import * as p from "@clack/prompts";
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INSTALLER_ROOT = resolve(__dirname, "..");
const MARKER_START = "<!-- BEGIN VTEX-DEPLOY -->";
const MARKER_END = "<!-- END VTEX-DEPLOY -->";

// Archivos nativos por agente
const AGENT_FILES: Record<string, { path: string; format: "markdown" | "json" }> = {
  "Claude Code":    { path: "CLAUDE.md",                          format: "markdown" },
  "Cursor":         { path: ".cursor/.cursorrules",               format: "markdown" },
  "Copilot":        { path: ".vscode/copilot-instructions.md",    format: "markdown" },
  "Windsurf":       { path: ".windsurf/rules.md",                 format: "markdown" },
  "Gemini CLI":     { path: ".gemini/GEMINI.md",                  format: "markdown" },
  "Codex":          { path: ".codex/agents.md",                   format: "markdown" },
  "OpenCode":       { path: ".opencode/opencode.json",            format: "json"     },
  "Universal":      { path: "AGENTS.md",                         format: "markdown" },
};

// Skills disponibles con metadatos para el instalador
const ALL_SKILLS = [
  { value: "vtex-deploy-qa",       hint: "Flujo de deploy a QA"              },
  { value: "vtex-deploy-prod",     hint: "Flujo de deploy a Producción"       },
  { value: "vtex-transform",       hint: "Transformación de vendor QA ↔ Prod" },
  { value: "vtex-git-flow",        hint: "Gestión de ramas y PRs"             },
  { value: "vtex-io-app-structure",hint: "Estructura de apps VTEX IO"         },
  { value: "vtex-manifest",        hint: "Configuración de manifest.json"     },
  { value: "vtex-store-framework", hint: "Store Framework y bloques"          },
];

// Detecta agentes instalados en el proyecto destino
function detectInstalledAgents(destPath: string): string[] {
  const detected: string[] = [];
  for (const [agent, { path }] of Object.entries(AGENT_FILES)) {
    if (existsSync(join(destPath, path))) detected.push(agent);
  }
  return detected;
}

// Detecta skills ya instaladas en .agents/skills/ del proyecto destino
function detectInstalledSkills(destPath: string): string[] {
  const skillsDir = join(destPath, ".agents", "skills");
  if (!existsSync(skillsDir)) return [];
  return ALL_SKILLS
    .map(s => s.value)
    .filter(skill => existsSync(join(skillsDir, skill)));
}

// Copia skills seleccionadas + rules + commands a .agents/ del proyecto destino
function copyCanonicalFiles(destPath: string, selectedSkills: string[]) {
  const agentsDir = join(destPath, ".agents");
  mkdirSync(agentsDir, { recursive: true });

  // Rules y commands: siempre se actualizan
  for (const dir of ["rules", "commands"]) {
    const src = join(INSTALLER_ROOT, dir);
    const dest = join(agentsDir, dir);
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
  }

  // Skills: solo las seleccionadas
  const skillsDir = join(agentsDir, "skills");
  mkdirSync(skillsDir, { recursive: true });
  for (const skill of selectedSkills) {
    const src = join(INSTALLER_ROOT, "skills", skill);
    const dest = join(skillsDir, skill);
    if (existsSync(src)) {
      cpSync(src, dest, { recursive: true });
    }
  }
}

// Inyecta el orchestrator en un archivo nativo usando marker-based merge
function injectOrchestrator(filePath: string, orchestratorContent: string, format: "markdown" | "json") {
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });

  let content = "";
  if (existsSync(filePath)) {
    content = readFileSync(filePath, "utf-8");
  }

  let injected: string;
  if (format === "json") {
    injected = JSON.stringify({ instructions: orchestratorContent }, null, 2);
  } else {
    const markedBlock = `${MARKER_START}\n${orchestratorContent}\n${MARKER_END}`;
    if (content.includes(MARKER_START)) {
      injected = content.replace(
        new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}`),
        markedBlock
      );
    } else {
      injected = content ? `${content}\n\n${markedBlock}` : markedBlock;
    }
  }

  writeFileSync(filePath, injected, "utf-8");
}

// Agrega entradas al .gitignore
function updateGitignore(destPath: string) {
  const gitignorePath = join(destPath, ".gitignore");
  const entries = [".agents/", ".vtex-deploy/", ".claude/"];
  let content = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf-8") : "";

  let added = false;
  for (const entry of entries) {
    if (!content.includes(entry)) {
      content += `\n${entry}`;
      added = true;
    }
  }
  if (added) writeFileSync(gitignorePath, content, "utf-8");
}

// Copia los subagentes a .claude/agents/ del proyecto destino (solo Claude Code)
function copyAgentDefinitions(destPath: string) {
  const agentsDir = join(destPath, ".claude", "agents");
  mkdirSync(agentsDir, { recursive: true });
  const src = join(INSTALLER_ROOT, "agents");
  cpSync(src, agentsDir, { recursive: true });
}

// Copia vtex-deploy-safety.md a .claude/rules/ del proyecto destino (solo Claude Code)
function copyScopedRules(destPath: string) {
  const rulesDir = join(destPath, ".claude", "rules");
  mkdirSync(rulesDir, { recursive: true });
  const src = join(INSTALLER_ROOT, "rules", "vtex-deploy-safety.md");
  const dest = join(rulesDir, "vtex-deploy-safety.md");
  cpSync(src, dest);
}

// Copia los hooks de quality gate a .claude/hooks/ del proyecto destino (solo Claude Code)
function copyHooks(destPath: string) {
  const hooksDir = join(destPath, ".claude", "hooks");
  mkdirSync(hooksDir, { recursive: true });
  const src = join(INSTALLER_ROOT, "hooks");
  if (existsSync(src)) {
    cpSync(src, hooksDir, { recursive: true });
  }
}

// Copia la config operativa al proyecto destino
function copyConfig(destPath: string) {
  const configSrc = join(INSTALLER_ROOT, ".vtex-deploy", "config.yaml");
  const configDest = join(destPath, ".vtex-deploy");
  mkdirSync(configDest, { recursive: true });
  const destFile = join(configDest, "config.yaml");
  if (!existsSync(destFile)) {
    cpSync(configSrc, destFile);
  }
}

async function main() {
  p.intro("vtex-deploy — Instalador de skills para agente de deploy VTEX IO");

  const destPath = process.cwd();
  p.log.info(`Instalando en: ${destPath}`);

  // FASE 1 — Modo de instalación
  const mode = await p.select({
    message: "¿Qué deseas instalar?",
    options: [
      { value: "full",   label: "Instalación completa (skills + rules + commands + orchestrator)" },
      { value: "skills", label: "Solo skills y rules" },
      { value: "custom", label: "Selección personalizada" },
    ],
  });
  if (p.isCancel(mode)) { p.cancel("Instalación cancelada."); process.exit(0); }

  // FASE 2 — Skills a instalar
  const installedSkills = detectInstalledSkills(destPath);

  let selectedSkills: string[];
  if (mode !== "custom") {
    selectedSkills = ALL_SKILLS.map(s => s.value);
  } else {
    const defaultValues = installedSkills.length > 0
      ? installedSkills
      : ALL_SKILLS.map(s => s.value);

    const skills = await p.multiselect({
      message: "¿Qué skills deseas instalar o actualizar?",
      options: ALL_SKILLS.map(({ value, hint }) => ({
        value,
        label: installedSkills.includes(value) ? `${value}  (instalado)` : value,
        hint,
      })),
      initialValues: defaultValues,
    });
    if (p.isCancel(skills)) { p.cancel("Instalación cancelada."); process.exit(0); }
    selectedSkills = skills as string[];
  }

  // FASE 3 — Scope
  const scope = await p.select({
    message: "¿Dónde instalar?",
    options: [
      { value: "local",  label: "Local — solo este proyecto (.agents/)" },
      { value: "global", label: "Global — todos los proyectos (~/.claude/)" },
    ],
  });
  if (p.isCancel(scope)) { p.cancel("Instalación cancelada."); process.exit(0); }

  // FASE 4 — Agentes a configurar
  const detectedAgents = detectInstalledAgents(destPath);
  const agentOptions = Object.keys(AGENT_FILES).map((agent) => ({
    value: agent,
    label: agent,
    selected: detectedAgents.includes(agent) || agent === "Claude Code",
  }));

  const selectedAgents = await p.multiselect({
    message: "¿Para qué agentes deseas generar los archivos nativos?",
    options: agentOptions,
    initialValues: detectedAgents.length > 0 ? detectedAgents : ["Claude Code"],
  });
  if (p.isCancel(selectedAgents)) { p.cancel("Instalación cancelada."); process.exit(0); }

  // FASE 5 — Confirmación
  p.log.step("Plan de instalación:");
  p.log.info(`  Skills: ${selectedSkills.join(", ")}`);
  p.log.info(`  Scope: ${scope}`);
  p.log.info(`  Agentes: ${(selectedAgents as string[]).join(", ")}`);

  const confirmed = await p.confirm({ message: "¿Proceder con la instalación?" });
  if (p.isCancel(confirmed) || !confirmed) { p.cancel("Instalación cancelada."); process.exit(0); }

  // EJECUCIÓN
  const spinner = p.spinner();
  const installDest = scope === "global" ? process.env.HOME! : destPath;

  // Fase A — Copias canónicas
  spinner.start("Copiando archivos a .agents/...");
  copyCanonicalFiles(installDest, selectedSkills);
  spinner.stop("Archivos copiados a .agents/");

  // Fase B — Generar archivos nativos por agente
  spinner.start("Generando archivos de configuración para los agentes...");
  const orchestratorPath = join(INSTALLER_ROOT, "system-prompts", "orchestrator.md");
  const orchestratorContent = readFileSync(orchestratorPath, "utf-8");

  for (const agent of selectedAgents as string[]) {
    const { path, format } = AGENT_FILES[agent];
    const fullPath = join(installDest, path);
    injectOrchestrator(fullPath, orchestratorContent, format);
  }
  spinner.stop("Archivos de agentes generados");

  // Fase C — Config operativa
  spinner.start("Copiando config operativa...");
  copyConfig(installDest);
  spinner.stop("Config copiada a .vtex-deploy/");

  // Fase D — .gitignore
  updateGitignore(installDest);

  // Fase E — Sub-agentes Claude Code (.claude/agents/)
  if ((selectedAgents as string[]).includes("Claude Code")) {
    spinner.start("Copiando sub-agentes a .claude/agents/...");
    copyAgentDefinitions(installDest);
    spinner.stop("Sub-agentes copiados a .claude/agents/");

    // Fase F — Reglas scoped (.claude/rules/)
    spinner.start("Copiando reglas scoped a .claude/rules/...");
    copyScopedRules(installDest);
    spinner.stop("Reglas copiadas a .claude/rules/");

    // Fase G — Hooks de quality gate (.claude/hooks/)
    spinner.start("Copiando hooks de quality gate a .claude/hooks/...");
    copyHooks(installDest);
    spinner.stop("Hooks copiados a .claude/hooks/");
  }

  p.outro(
    "vtex-deploy instalado correctamente. El agente ya tiene acceso a los skills de deploy VTEX IO.\n" +
    "  Ejecuta vtex-deploy-init para configurar el proyecto.\n\n" +
    "  Recomendación para sesiones largas de deploy:\n" +
    "  CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50 claude"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
