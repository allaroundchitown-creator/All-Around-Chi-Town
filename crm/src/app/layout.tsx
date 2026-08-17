import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const protocol = incoming.get("x-forwarded-proto") ?? "http";
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const image = `${protocol}://${host}/og.png`;
  const title = "All Around Chi Town CRM";
  const description = "Find better Chicagoland leads and keep every conversation moving.";
  return { title, description, openGraph: { title, description, images: [{ url: image, width: 1760, height: 917 }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#090909] text-[#f7f4ed]"><MobileNav /><div className="mx-auto flex min-h-screen max-w-[1600px]"><Sidebar /><main className="min-w-0 flex-1">{children}</main></div></body>
    </html>
  );
}
