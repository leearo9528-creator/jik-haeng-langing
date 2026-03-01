import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "직결 - 수수료 0원 행사 매칭 플랫폼",
  description: "",
  themeColor: "#3182F6",
  openGraph: {
    title: "직결 - 수수료 0원 행사 매칭 플랫폼",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "직결 - 수수료 0원 행사 매칭 플랫폼",
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
        className={`${geistSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
