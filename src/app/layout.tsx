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
  title: "WebDroid — Android-style Phone in Your Browser (WebAssembly)",
  description:
    "A phone that lives in your browser: boot it, unlock it, and install apps from the built-in local Play Store. Fully offline, no install, no cloud — powered by WebAssembly (v86) under the hood.",
  keywords: [
    "Android phone",
    "WebAssembly",
    "v86",
    "browser emulator",
    "local Play Store",
    "offline",
    "PWA",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/favicon-32.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "WebDroid — Android-style Phone in Your Browser",
    description:
      "Boot a phone in your browser, install apps from the local Play Store, all offline via WebAssembly.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#040605",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        {children}
      </body>
    </html>
  );
}
