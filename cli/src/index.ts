#!/usr/bin/env node

import { Command } from "commander";

import { registerConnectCommand } from "./commands/connect";
import { registerLoginCommand } from "./commands/login";

async function main() {
  const program = new Command();

  program
    .name("mr-promth")
    .description("Mr.Promth local agent runner CLI")
    .version("0.1.0");

  registerLoginCommand(program);
  registerConnectCommand(program);

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
