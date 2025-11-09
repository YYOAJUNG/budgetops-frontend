import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BudgetOps - Multi-Cloud Cost Management",
  description: "Comprehensive cloud cost management and optimization platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* PortOne SDK - 카카오페이 결제용 */}
        <Script
          src="https://cdn.iamport.kr/v1/iamport.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

