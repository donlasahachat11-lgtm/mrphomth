import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_API_URL = process.env.MRPROMTH_API_URL ?? "ws://localhost:3000/api/ws";
const DEFAULT_PROJECT_DIR =
  process.env.MRPROMTH_PROJECT_DIR ?? join(process.cwd(), "mrpromth-projects");

export interface AuthConfig {
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number | null;
  tokenType?: string;
}

export interface SupabaseConfig {
  url?: string;
  anonKey?: string;
}

export interface CliConfig {
  auth?: AuthConfig;
  apiUrl?: string;
  projectDirectory?: string;
  supabase?: SupabaseConfig;
}

const CONFIG_DIR = process.env.MRPROMTH_CONFIG_DIR ?? join(homedir(), ".mrpromth");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

const DEFAULT_CONFIG: CliConfig = {
  apiUrl: DEFAULT_API_URL,
  projectDirectory: DEFAULT_PROJECT_DIR,
};

export function getConfigPath() {
  return CONFIG_PATH;
}

async function ensureConfigDir() {
  await mkdir(CONFIG_DIR, { recursive: true });
}

export async function loadConfig(): Promise<CliConfig> {
  await ensureConfigDir();

  try {
    const raw = await readFile(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw) as CliConfig;
    return mergeConfig(DEFAULT_CONFIG, parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_CONFIG };
    }

    throw new Error(`Failed to read CLI config: ${(error as Error).message}`);
  }
}

export async function saveConfig(partial: Partial<CliConfig>): Promise<CliConfig> {
  await ensureConfigDir();

  const current = await loadConfig();
  const merged = mergeConfig(current, partial);

  await writeFile(CONFIG_PATH, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

function mergeConfig(base: CliConfig, patch: Partial<CliConfig>): CliConfig {
  const next: CliConfig = { ...base };

  if (patch.apiUrl !== undefined) {
    next.apiUrl = patch.apiUrl;
  }

  if (patch.projectDirectory !== undefined) {
    next.projectDirectory = patch.projectDirectory;
  }

  if (patch.auth) {
    next.auth = { ...(base.auth ?? {}), ...patch.auth };
  }

  if (patch.supabase) {
    next.supabase = { ...(base.supabase ?? {}), ...patch.supabase };
  }

  return next;
}
