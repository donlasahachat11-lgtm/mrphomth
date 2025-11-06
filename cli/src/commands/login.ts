import chalk from "chalk";
import type { Command } from "commander";
import prompts, { type PromptObject } from "prompts";

import type { CliConfig, SupabaseConfig } from "../config";
import { getConfigPath, loadConfig, saveConfig } from "../config";
import { createSupabaseClient } from "../supabase";

interface LoginCommandOptions {
  email?: string;
  password?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export function registerLoginCommand(program: Command) {
  program
    .command("login")
    .description("Authenticate with your Mr.Promth account")
    .option("--email <email>", "Email address used for Mr.Promth")
    .option("--password <password>", "Password (use with caution; consider interactive prompt instead)")
    .option("--supabase-url <url>", "Override Supabase project URL")
    .option("--supabase-key <key>", "Override Supabase anon key")
    .action(async (options: LoginCommandOptions) => {
      try {
        await handleLogin(options);
      } catch (error) {
        process.exitCode = 1;
        const message =
          error instanceof Error ? error.message : "An unexpected error occurred during login.";
        console.error(chalk.red(`✖ ${message}`));
      }
    });
}

async function handleLogin(options: LoginCommandOptions) {
  const currentConfig = await loadConfig();
  const configForLogin: CliConfig = {
    ...currentConfig,
    supabase: {
      ...(currentConfig.supabase ?? {}),
    },
  };

  if (options.supabaseUrl) {
    configForLogin.supabase = configForLogin.supabase ?? {};
    configForLogin.supabase.url = options.supabaseUrl;
  }

  if (options.supabaseKey) {
    configForLogin.supabase = configForLogin.supabase ?? {};
    configForLogin.supabase.anonKey = options.supabaseKey;
  }

  let email = options.email?.trim();
  let password = options.password;

  const questions: PromptObject[] = [];

  if (!email) {
    questions.push({
      type: "text",
      name: "email",
      message: "Email",
      validate: (value: string) => (value?.trim() ? true : "Email is required"),
    });
  }

  if (!password) {
    questions.push({
      type: "password",
      name: "password",
      message: "Password",
      validate: (value: string) => (value?.length ? true : "Password is required"),
    });
  }

  if (questions.length > 0) {
    const answers = await prompts(questions, {
      onCancel: () => {
        throw new Error("Login cancelled by user.");
      },
    });

    if (!email) {
      email = answers.email?.trim();
    }
    if (!password) {
      password = answers.password;
    }
  }

  if (!email) {
    throw new Error("Email is required to authenticate.");
  }

  if (!password) {
    throw new Error("Password is required to authenticate.");
  }

  const supabase = createSupabaseClient(configForLogin);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }

  const session = data.session;

  if (!session) {
    throw new Error("Authentication succeeded but no session was returned from Supabase.");
  }

  const configPatch: Partial<CliConfig> = {
    auth: {
      email,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ?? null,
      tokenType: session.token_type,
    },
  };

  const supabasePatch: SupabaseConfig = {};
  if (options.supabaseUrl) {
    supabasePatch.url = options.supabaseUrl;
  }
  if (options.supabaseKey) {
    supabasePatch.anonKey = options.supabaseKey;
  }
  if (Object.keys(supabasePatch).length > 0) {
    configPatch.supabase = {
      ...(currentConfig.supabase ?? {}),
      ...supabasePatch,
    };
  }

  await saveConfig(configPatch);

  console.log(chalk.green("✔ Login successful."));
  console.log(chalk.gray(`Configuration saved to ${getConfigPath()}`));
  console.log(
    chalk.blueBright(
      "You can now run `mr-promth connect` (to be implemented) to attach your local project workspace.",
    ),
  );
}
