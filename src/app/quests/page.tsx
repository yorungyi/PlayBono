"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadQuests, loadGoals } from "@/lib/offline";

export default function QuestsPage(){
  const [quests, setQuests] = useState(loadQuests());
  const [goals, setGoals] = useState(loadGoals());

  useEffect(()=>{
    setQuests(loadQuests());
    setGoals(loadGoals());
  }, []);

  return (
    <main className="container">
      <div className="card" style={{padding:18}}>
        <div className="badge">퀘스트</div>
        <h1 className="h1" style={{marginTop:10}}>오늘/이번 주 미션</h1>
        <p className="p">작은 목표를 달성하며 보상을 모아요.</p>
        <div className="hr" />
        <div className="questGrid">
          <div className="questCard">
            <div className="h3">오늘의 미션</div>
            <div className="p">10문제 완료</div>
            <div className={"questState " + (quests.daily.completed ? "on" : "")}>
              {quests.daily.completed ? "완료!" : "진행 중"}
            </div>
          </div>
          <div className="questCard">
            <div className="h3">완벽 정답</div>
            <div className="p">10문제 모두 정답</div>
            <div className={"questState " + (quests.daily.perfect ? "on" : "")}>
              {quests.daily.perfect ? "완료!" : "도전 중"}
            </div>
          </div>
          <div className="questCard">
            <div className="h3">이번 주 목표</div>
            <div className="p">주 {goals.weeklySessions}회 학습</div>
            <div className="questBar">
              <span style={{width:`${Math.min(100, Math.round((quests.weekly.sessions / goals.weeklySessions) * 100))}%`}} />
            </div>
            <div className="small">{quests.weekly.sessions}/{goals.weeklySessions}회</div>
          </div>
        </div>
        <div className="hr" />
        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
          <Link className="btn btnPrimary" href="/mission/daily">오늘의 미션</Link>
          <Link className="btn" href="/season">시즌 패스</Link>
          <Link className="btn btnGhost" href="/">홈</Link>
        </div>
      </div>
    </main>
  );
}
