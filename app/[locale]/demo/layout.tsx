import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TwinO Sales Twin Demo",
  description: "An isolated, fictional end-to-end TwinO sales journey for the Colosseum Loom demo.",
};

export default function DemoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
