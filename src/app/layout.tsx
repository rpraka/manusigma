import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ManuSigma | Manufacturing Predictive Intelligence",
  description:
    "AI-powered manufacturing quality management platform. Predict defects, optimize processes, and drive Six Sigma excellence with real-time predictive analytics across your production lines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-[#0a0f1a] text-slate-100 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
