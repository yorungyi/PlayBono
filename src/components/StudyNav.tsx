"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function A({href, label}:{href:string; label:string}) {
  const p = usePathname();
  const active = p === href || (href !== "/" && p.startsWith(href));
  return (
    <Link href={href} style={{
      padding:"8px 10px",
      borderRadius:12,
      border: active ? "1px solid #e5e7eb" : "1px solid transparent",
      background: active ? "#fff" : "transparent",
      fontWeight: 900,
      fontSize: 13
    }}>
      {label}
    </Link>
  );
}

export default function StudyNav(){
  return (
    <div className="nav noPrint">
      <div className="navInner">
        <div className="brand">
          <div className="logo" aria-hidden />
          <div>
            <div className="brandTitle">수학펫</div>
            <div className="brandSub">오늘 10문제 · 알→부화→진화</div>
          </div>
        </div>
        <div className="navLinks">
          <A href="/" label="홈" />
          <A href="/mission/daily" label="오늘의 미션" />
          <A href="/worksheets/1/add/easy" label="워크시트" />
          <A href="/pet" label="펫" />
          <A href="/settings" label="설정" />
          <A href="/parents" label="부모용" />
        </div>
      </div>
    </div>
  );
}
