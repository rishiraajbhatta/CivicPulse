import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicPulse | Your City. Your Voice. Real Change.",
  description:
    "Report civic issues, track their progress and help build better communities with CivicPulse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}