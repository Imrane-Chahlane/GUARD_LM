import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guard_LM Chatbot Tester",
  description: "A minimal local tester for Guard_LM middleware behavior."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
