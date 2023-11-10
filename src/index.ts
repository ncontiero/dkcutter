#!/usr/bin/env node

import path from "node:path";
import { Command } from "commander";
import { z } from "zod";

import { handleError } from "@/utils/handleError";

process.on("SIGINT", handleError);
process.on("SIGTERM", handleError);

const optionsSchema = z.object({
  cwd: z.string(),
  default: z.boolean(),
});

async function main() {
  const program = new Command()
    .name("dkcutter")
    .description("A command-line utility that creates projects from templates.")
    .version("1.0.0", "-v, --version", "Display the version number.")
    .usage("template [options]")
    .option("-y, --default", "Use the template's default values.", false)
    .option(
      "-c, --cwd <cwd>",
      "The working directory. Defaults to the current directory.",
      process.cwd(),
    )
    .argument("[template]", "The url or path of the template.")
    .parse(process.argv);

  const options = optionsSchema.parse(program.opts());
  const cwd = path.resolve(options.cwd);

  const args = program.args;
  const isLocalProject = args[0].startsWith(".");
  if (!args[0]) {
    program.help();
  } else if (z.string().url().safeParse(args[0]).success) {
    console.log("TODO: Implement remote templates");
  } else if (!isLocalProject) {
    throw new Error("Invalid template. Please specify a valid url or path!");
  }

  console.log(options);
  console.log(isLocalProject);
  console.log(cwd);
}

main().catch(handleError);
