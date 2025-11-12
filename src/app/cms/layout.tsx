import type { ReactNode } from "react";
import CMSLayoutClient from "./components/CMSLayoutClient";

export default function CMSLayout({ children }: { children: ReactNode }) {
  return <CMSLayoutClient>{children}</CMSLayoutClient>;
}
