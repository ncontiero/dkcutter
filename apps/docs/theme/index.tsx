import "./index.css";
import { useVersion } from "@rspress/core/runtime";
import { Banner, Layout as BasicLayout } from "@rspress/core/theme-original";

function Layout() {
  const version = useVersion();
  return (
    <BasicLayout
      beforeNav={
        version === "latest" ? (
          <Banner
            href="/beta/guide/start/introduction"
            message="🚀 DKCutter v6 (Beta) is here! Click to explore the new features and migration guide."
          />
        ) : null
      }
    />
  );
}

export { Layout };
export * from "@rspress/core/theme-original";
