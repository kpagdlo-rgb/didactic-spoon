import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";

export const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
export const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
export const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
