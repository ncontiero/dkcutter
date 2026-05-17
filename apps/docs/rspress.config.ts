import path from "node:path";
import { defineConfig } from "@rspress/core";
import { pluginFontOpenSans } from "rspress-plugin-font-open-sans";

export default defineConfig({
  title: "DKCutter",
  description: "A command-line utility that creates projects from templates.",
  logo: "/dkcutter-icon.png",
  logoText: "DKCutter",
  icon: "/dkcutter-icon.png",
  globalStyles: path.join(__dirname, "theme", "index.css"),
  route: {
    cleanUrls: true,
  },
  plugins: [pluginFontOpenSans()],
  themeConfig: {
    enableScrollToTop: true,
    footer: {
      message: "© 2024-present Nicolas Contiero",
    },
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/ncontiero/dkcutter",
      },
    ],
    editLink: {
      docRepoBaseUrl:
        "https://github.com/ncontiero/dkcutter/tree/main/apps/docs/docs",
    },
  },
});
