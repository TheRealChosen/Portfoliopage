import type { Metadata } from "next";
import { Silkscreen, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rüzgar Yilmaz — I build websites",
  description:
    "Interactive portfolio — depth-mapped PSP centerpiece, vinyl playback sync, and clean web development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <body
        className={`${silkscreen.variable} ${jetbrains.variable} bg-black text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
