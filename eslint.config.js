import { ncontiero } from "@ncontiero/eslint-config";

export default ncontiero(
  {
    ignores: ["./packages", "./apps"],
  },
  {
    files: ["./template/hooks/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
);
