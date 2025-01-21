import "./index.css";
import { PackageManagerTabs as RspressPackageManagerTabs } from "rspress/theme";

interface PackageManagerTabProps {
  command: string;
  isExecuted?: boolean;
  additionalTabs?: {
    tool: string;
    icon?: React.ReactNode;
  }[];
}

function xCommands(command: string) {
  return {
    npm: `npx ${command}`,
    yarn: `yarn dlx ${command}`,
    pnpm: `pnpm dlx ${command}`,
    bun: `bunx ${command}`,
  };
}
export function PackageManagerTabs({
  command,
  isExecuted = false,
  ...props
}: PackageManagerTabProps) {
  const c = isExecuted ? xCommands(command) : command;
  return (
    <div className="package-manager-tabs">
      <RspressPackageManagerTabs command={c} {...props} />
    </div>
  );
}
