"use client";

/**
 * AdSense slot for CONTENT pages only (worksheets/practice).
 * - Avoid placing content ads on game interfaces (/mission) per AdSense guidance.
 * - Supports Non-Personalized Ads by setting requestNonPersonalizedAds=1.
 */
import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export default function AdSenseSlot(props: {
  client: string; // ca-pub-xxxx
  slot: string;
  format?: "auto" | "rectangle";
  responsive?: boolean;
  nonPersonalized?: boolean;
}) {
  const { client, slot, format="auto", responsive=true, nonPersonalized=true } = props;

  useEffect(() => {
    if (!window.adsbygoogle) window.adsbygoogle = [];
    if (nonPersonalized) (window.adsbygoogle as any).requestNonPersonalizedAds = 1;

    try {
      (window.adsbygoogle as any[]).push({});
    } catch {
      // ignore
    }
  }, [nonPersonalized]);

  return (
    <div className="noPrint" style={{margin:"12px 0"}}>
      <Script
        id="adsbygoogle-js"
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{display:"block"}}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true":"false"}
      />
      <div className="small" style={{marginTop:6}}>※ 학습 콘텐츠 페이지에만 광고가 표시됩니다.</div>
    </div>
  );
}
