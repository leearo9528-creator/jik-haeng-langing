import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SHARE_DESCRIPTION = "사장님 3초만에 수수료 0원 혜택에 탑승하세요 !";

export const metadata: Metadata = {
  title: "직행 - 수수료 0원 행사 매칭 플랫폼",
  description: SHARE_DESCRIPTION,
  openGraph: {
    title: "직행 - 수수료 0원 행사 매칭 플랫폼",
    description: SHARE_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "직행 - 수수료 0원 행사 매칭 플랫폼",
    description: SHARE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
