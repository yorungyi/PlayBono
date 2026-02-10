"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadQuests } from "@/lib/offline";

const rewards = [
  { lvl: 1, reward: "+5 코인" },
  { lvl: 2, reward: "스티커 1장" },
  { lvl: 3, reward: "+8 코인" },
  { lvl: 4, reward: "스킨 할인권" },
  { lvl: 5, reward: "+12 코인" },
];

export default function SeasonPage(){
  const [xp, setXp] = useState(0);
  const level = Math.min(5, Math.floor(xp / 30) + 1);
  const progress = Math.min(100, Math.round(((xp % 30) / 30) * 100));

  useEffect(()=>{
    setXp(loadQuests().season.xp);
  }, []);

  return (
    <main className="container">
      <div className="card" style={{padding:18}}>
        <div className="badge">시즌 패스</div>
        <h1 className="h1" style={{marginTop:10}}>이번 시즌 진행도</h1>
        <p className="p">문제를 풀수록 시즌 경험치가 올라가요.</p>
        <div className="seasonBar">
          <span style={{width:`${progress}%`}} />
        </div>
        <div className="small">레벨 {level} · 시즌 XP {xp}</div>
        <div className="hr" />
        <div className="seasonGrid">
          {rewards.map(r => (
            <div key={r.lvl} className={"seasonCard " + (level >= r.lvl ? "on" : "")}>
              <div className="h3">Lv {r.lvl}</div>
              <div className="p">{r.reward}</div>
            </div>
          ))}
        </div>
        <div className="hr" />
        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
          <Link className="btn btnPrimary" href="/mission/daily">미션으로 XP 획득</Link>
          <Link className="btn" href="/quests">퀘스트</Link>
          <Link className="btn btnGhost" href="/">홈</Link>
        </div>
      </div>
    </main>
  );
}
