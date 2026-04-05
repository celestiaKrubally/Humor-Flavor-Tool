import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Humor Flavor Tool", description: "Manage humor flavors and prompt chains" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
