import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Lordle",
  description:
    "Infinite Lordle — built by Looped. Infinite guesses, infinite words, infinite pain.",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} dark`}>
      <body className="flex min-h-screen flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
