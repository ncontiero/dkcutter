#!/usr/bin/env node

import { Command } from "commander";

import { handleError } from "@/utils/handleError";
import { z } from "zod";

process.on("SIGINT", handleError);
process.on("SIGTERM", handleError);

async function main() {
  const program = new Command()
    .name("dkcutter")
    .description("A command-line utility that creates projects from templates.")
    .version("1.0.0", "-v, --version", "Display the version number.")
    .argument("[template]", "The url or path of the template.")
    .parse(process.argv);

  const args = program.args;
  let isLocalProject = false;
  if (!args[0]) {
    program.help();
  } else if (args[0].startsWith(".")) {
    isLocalProject = true;
  } else if (z.string().url().safeParse(args[0]).success) {
    console.log("TODO: Implement remote templates");
  } else {
    throw new Error("Invalid template. Please specify a valid url or path!");
  }

  console.log(isLocalProject);
}

main().catch(handleError);
