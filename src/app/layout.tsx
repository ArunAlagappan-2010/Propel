import type { Metadata } from "next";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Propel — Science to Solutions",
    template: "%s | Propel",
  },
  description:
    "Propel is a student-led nonprofit bridging gaps in access to education. Innovation Tank: a week-long program where grade 8–9 students solve real-world problems with expert mentors and cash prizes.",
  keywords: [
    "Propel",
    "Innovation Tank",
    "education nonprofit",
    "student innovation",
    "India",
  ],
  openGraph: {
    title: "Propel — Science to Solutions",
    description:
      "Empowering underprivileged students through science, innovation, and real-world problem solving.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
