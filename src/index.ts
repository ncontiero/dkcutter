#!/usr/bin/env node

import { Command } from "commander";

async function main() {
  const program = new Command()
    .name("dkcutter")
    .description("A command-line utility that creates projects from templates.")
    .version("1.0.0", "-v, --version", "Display the version number.")
    .argument("[template]", "The url or path of the template.")
    .parse(process.argv);

  if (!program.args[0]) {
    program.help();
  } else if (program.args[0].startsWith(".")) {
    console.log("TODO: Implement local templates");
  } else if (program.args[0].startsWith("http")) {
    console.log("TODO: Implement remote templates");
  }
}

main().catch(console.error);
