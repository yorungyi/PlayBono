"use client";

import { useEffect, useMemo, useState } from "react";
import ParentGate from "@/components/ParentGate";
import { ensureAnonAuth, getDbClient } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from "firebase/firestore";
import { defaultUserDoc, UserDoc } from "@/lib/model";
import { listLocalDaily, loadLocalUser, loadGoals, saveGoals } from "@/lib/offline";

type DailyScore = { id:string; score?: { correct:number; total:number; durationSec:number } };

export default function ParentsPage(){
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDoc>(defaultUserDoc);
  const [recent, setRecent] = useState<DailyScore[]>([]);
  const [goals, setGoals] = useState(loadGoals());

  useEffect(()=>{
    if (!passed) return;
    (async ()=>{
      const db = getDbClient();
      if (!db) {
        const localUser = loadLocalUser();
        setUser(localUser);
        const items = listLocalDaily(7).map(d => ({ id: d.dateYmd, score: d.score }));
        setRecent(items);
        setGoals(loadGoals());
        setLoading(false);
        return;
      }
      const u = await ensureAnonAuth();
      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) setUser(snap.data() as UserDoc);

      const qy = query(collection(db, "users", u.uid, "daily"), orderBy("dateYmd","desc"), limit(7));
      const ds = await getDocs(qy);
      const items: DailyScore[] = [];
      ds.forEach(d => items.push({ id: d.id, ...(d.data() as any) }));
      setRecent(items);
      setLoading(false);
    })();
  }, [passed]);

  const summary = useMemo(()=>{
    const scores = recent.map(r => r.score).filter(Boolean) as any[];
    const total = scores.reduce((s,x)=>s + x.total, 0);
    const correct = scores.reduce((s,x)=>s + x.correct, 0);
    const sec = scores.reduce((s,x)=>s + x.durationSec, 0);
    const acc = total ? Math.round((correct/total)*100) : 0;
    const avgSec = scores.length ? Math.round(sec / scores.length) : 0;
    return { acc, avgSec, sessions: scores.length };
  }, [recent]);

  if (!passed) {
    return (
      <main className="container">
        <ParentGate onPass={()=>setPassed(true)} />
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card" style={{padding:18}}>
        <div className="badge">부모용 리포트</div>
        <h1 className="h1" style={{marginTop:10}}>학습 활동 요약</h1>
        <p className="p">아이의 화면 시간이 “공부”로 보이도록, 결과를 명확하게 보여줍니다.</p>
        <div className="hr" />

        {loading ? (
          <p className="p">불러오는 중…</p>
        ) : (
          <>
            <div className="kpi">
              <div className="item"><div className="v">초{user.grade}</div><div className="t">학년</div></div>
              <div className="item"><div className="v">{summary.sessions}회</div><div className="t">최근 7일 미션</div></div>
              <div className="item"><div className="v">{summary.acc}%</div><div className="t">정답률</div></div>
              <div className="item"><div className="v">{summary.avgSec}초</div><div className="t">평균 소요</div></div>
              <div className="item"><div className="v">{user.streak.count}일</div><div className="t">연속</div></div>
            </div>

            <div className="hr" />
            <div className="h2">최근 기록(최대 7일)</div>
            {recent.length === 0 ? (
              <p className="p">아직 기록이 없습니다.</p>
            ) : (
              <div style={{display:"grid", gap:10}}>
                {recent.map((r)=>(
                  <div key={r.id} className="card" style={{padding:12, boxShadow:"none"}}>
                    <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap"}}>
                      <div style={{fontWeight:900}}>{r.id}</div>
                      <div className="small">
                        {r.score ? `${r.score.correct}/${r.score.total} · ${r.score.durationSec}초` : "진행 중"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="hr" />
            <div className="h2">부모용 안내</div>
            <ul className="p" style={{paddingLeft:18}}>
              <li>데일리 미션은 1~3분 내 완료를 목표로 설계했습니다.</li>
              <li>진화는 정답률뿐 아니라 연속 미션도 필요해 “루틴”을 만듭니다.</li>
              <li>광고는 워크시트/연습(학습 콘텐츠) 페이지에만 제한적으로 노출됩니다.</li>
            </ul>

            <div className="hr" />
            <div className="h2">학습 목표 설정</div>
            <div className="p">아이에게 맞는 목표를 설정해 주세요.</div>
            <div style={{display:"flex", gap:10, flexWrap:"wrap", marginTop:8}}>
              <label className="small">
                하루 목표 문제 수
                <input
                  className="input"
                  type="number"
                  min="5"
                  max="50"
                  value={goals.dailyQuestions}
                  onChange={(e)=>setGoals(prev=>({ ...prev, dailyQuestions: Number(e.target.value) }))}
                />
              </label>
              <label className="small">
                주간 목표 횟수
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="7"
                  value={goals.weeklySessions}
                  onChange={(e)=>setGoals(prev=>({ ...prev, weeklySessions: Number(e.target.value) }))}
                />
              </label>
            </div>
            <div style={{display:"flex", gap:8, marginTop:10}}>
              <button className="btn btnPrimary" onClick={()=>saveGoals(goals)}>목표 저장</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
