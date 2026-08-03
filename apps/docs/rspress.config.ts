import path from "node:path";
import { defineConfig } from "@rspress/core";
import pluginFileTree from "rspress-plugin-file-tree";
import { pluginFontOpenSans } from "rspress-plugin-font-open-sans";

export default defineConfig({
  title: "DKCutter",
  description: "A command-line utility that creates projects from templates.",
  siteOrigin: "https://dkcutter.ncontiero.com",
  icon: "/dkcutter-icon.png",
  logo: "/dkcutter-icon.png",
  logoText: "DKCutter",
  globalStyles: path.join(__dirname, "theme", "index.css"),
  llms: true,
  route: {
    cleanUrls: true,
  },
  plugins: [pluginFontOpenSans(), pluginFileTree()],
  themeConfig: {
    enableScrollToTop: true,
    lastUpdated: process.env.NODE_ENV === "production",
    footer: {
      message: "© 2024-present Nicolas Contiero",
    },
    editLink: {
      docRepoBaseUrl:
        "https://github.com/ncontiero/dkcutter/tree/main/apps/docs/docs",
    },
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/ncontiero/dkcutter",
      },
      {
        icon: "npm",
        mode: "link",
        content: "https://www.npmjs.com/package/dkcutter",
      },
    ],
  },
  markdown: {
    link: {
      checkAnchors: true,
    },
  },
});
