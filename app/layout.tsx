import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Roboto } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const robotoHeading = Roboto({ subsets: ["latin"], variable: "--font-heading" });
const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SellerVai Shop",
  description: "Public storefront for SellerVai sellers",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const subdomain = headerList.get("x-subdomain");

  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        notoSans.variable,
        robotoHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900">
        <Providers subdomain={subdomain}>
          <div className="animate-fade-in">{children}</div>
        </Providers>
      </body>
    </html>
  );
}