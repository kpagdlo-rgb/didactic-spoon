import type { Metadata } from "next";
import { display, sans, mono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meder — Order clarity. Without another trade.",
  description:
    "Read-only, synthetic Spot order diagnostics. Exact local checks, never order execution.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
