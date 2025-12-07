import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TASA | Skill and Service Hub | Young Talent Marketplace",
  description:
    "Connect with qualified professionals. Find expert services in programming, design, marketing, and more. Trusted platform for hiring skilled professionals.",
  keywords:
    "professional services, freelancers, experts, TASA, hiring, skilled professionals, young talents, skills, services",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo/favicon.ico", sizes: "16x16", type: "image/x-icon" },
    ],
    apple: [
      { url: "/logo/logo_bg_teal.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
