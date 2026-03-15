import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HUMM",
  description: "A playful Next.js full-stack app for preschool humming sessions."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
