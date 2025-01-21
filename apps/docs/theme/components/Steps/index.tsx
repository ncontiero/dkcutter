import "./index.css";
import type { ReactNode } from "react";
import { Steps as RspressSteps } from "@theme";

export function Steps(props: { children: ReactNode }) {
  return <RspressSteps {...props} />;
}
