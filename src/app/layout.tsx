import "./globals.css";
import StudyNav from "@/components/StudyNav";
import Script from "next/script";

export const metadata = {
  title: "수학펫 | 오늘 10문제 학습",
  description: "초1~초4 사칙연산 10문제로 매일 학습하고, 알→부화→진화로 성취감을 키우는 학습 웹.",
};

export default function RootLayout({ children }:{ children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2888431394022571"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <StudyNav />
        {children}
      </body>
    </html>
  );
}
