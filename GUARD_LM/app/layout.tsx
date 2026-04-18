import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guard_LM",
  description: "Middleware security for prompt injection resistant chatbot applications."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
