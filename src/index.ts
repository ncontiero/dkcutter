#!/usr/bin/env node

import path from "node:path";
import fs from "fs-extra";
import { Command } from "commander";
import { z } from "zod";

import { getTemplate } from "@/helpers/getTemplate";
import { handleError } from "@/utils/handleError";
import { CONFIG_FILE_NAME, PKG_ROOT, PKG_TEMPLATE } from "@/consts";
import { getConfig } from "./helpers/getConfig";

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

  // Ensure target directory exists.
  if (!fs.existsSync(cwd)) {
    throw new Error(`The path ${cwd} does not exist. Please try again.`);
  }

  const args = program.args;
  const isLocalProject = args[0]?.startsWith(".") || false;
  if (!args[0]) {
    program.help();
  } else if (z.string().url().safeParse(args[0]).success) {
    await getTemplate({ url: args[0], outputDir: PKG_TEMPLATE });
  } else if (!isLocalProject) {
    throw new Error("Invalid template. Please specify a valid url or path!");
  }

  const config = await getConfig(isLocalProject ? cwd : PKG_ROOT);
  if (!config)
    throw new Error("Invalid configuration found. Please try again.");
  fs.removeSync(path.join(PKG_ROOT, CONFIG_FILE_NAME));

  console.log(config);
}

main().catch(handleError);
