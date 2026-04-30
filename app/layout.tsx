import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "stk",
  description: "Inventory tracking web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-950">
        <Nav />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
