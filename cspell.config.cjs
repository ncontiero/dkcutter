const { banWords } = require("cspell-ban-words");

module.exports = {
  $schema:
    "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json",
  version: "0.2",
  files: ["**/*.{js,jsx,ts,tsx,md,mdx,json}"],
  enableFiletypes: ["mdx", "github-actions-workflow"],
  ignoreRegExpList: [
    // ignore markdown anchors such as [fooBar](#foobar)
    "#.*?\\)",
  ],
  dictionaryDefinitions: [
    {
      name: "project-words",
      path: "./project-words.txt",
      addWords: true,
    },
  ],
  dictionaries: ["project-words"],
  ignorePaths: [
    "node_modules",
    "/project-words.txt",
    "package.json",
    "pnpm-lock.yaml",
    "doc_build",
    "template-test",
  ],
  flagWords: banWords,
  caseSensitive: true,
};
