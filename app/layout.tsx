import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Form Alumni & Rekan | Akademi Trainer",
  description: "Form pendataan alumni dan rekan atau kolega Akademi Trainer.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}