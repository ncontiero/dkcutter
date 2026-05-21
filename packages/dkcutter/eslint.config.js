import { ncontiero } from "@ncontiero/eslint-config";

export default ncontiero({
  ignores: ["!./test/fixtures/**"],
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
});
