import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ErrorContainer } from "@/components/ui/error-container";
import { ErrorBoundary } from "@/components/error-boundary";

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
      <body className={inter.className}>
        <Providers>
          <ErrorBoundary>
            {children}
            <ErrorContainer />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}

