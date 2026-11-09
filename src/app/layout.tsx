import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebDroid — Android-style Web Phone Simulator",
  description:
    "An interactive Android-style smartphone experience built with Next.js & React. Install sandboxed on-device apps from the local Droid Store and run an optional WebAssembly x86 Linux terminal.",
  keywords: [
    "Android simulator",
    "web OS",
    "WebAssembly",
    "v86",
    "browser phone",
    "offline PWA",
    "React",
    "Next.js",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/favicon-32.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "WebDroid — Android-style Web Phone Simulator",
    description:
      "Interactive phone simulator in your browser. Install on-device apps, customize wallpapers, and explore an optional WebAssembly x86 Linux terminal.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#040605",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-emerald-400/30 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
