"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ensureAnonAuth, getDbClient } from "@/lib/firebase";
import { defaultUserDoc, UserDoc } from "@/lib/model";
import { loadLocalUser, saveLocalUser } from "@/lib/offline";

export default function SettingsPage(){
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDoc>(defaultUserDoc);
  const [saved, setSaved] = useState(false);

  useEffect(()=>{
    (async ()=>{
      const db = getDbClient();
      if (!db) {
        const localUser = loadLocalUser();
        setUser(localUser);
        setLoading(false);
        return;
      }
      const u = await ensureAnonAuth();
      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) setUser(snap.data() as UserDoc);
      setLoading(false);
    })();
  }, []);

  async function save(){
    const db = getDbClient();
    if (!db) {
      saveLocalUser(user);
      setSaved(true);
      setTimeout(()=>setSaved(false), 1200);
      return;
    }
    const u = await ensureAnonAuth();
    const userRef = doc(db, "users", u.uid);
    await updateDoc(userRef, {
      grade: user.grade,
      opsEnabled: user.opsEnabled,
    });
    setSaved(true);
    setTimeout(()=>setSaved(false), 1200);
  }

  function toggle(op: "add"|"sub"|"mul"|"div"){
    setUser(prev=>({ ...prev, opsEnabled: { ...prev.opsEnabled, [op]: !prev.opsEnabled[op] } }));
  }

  if (loading){
    return (
      <main className="container">
        <div className="card" style={{padding:18}}>
          <div className="h2">설정 불러오는 중…</div>
          <p className="p">학년/연산 설정을 준비하고 있습니다.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card" style={{padding:18}}>
        <div className="badge">설정</div>
        <h1 className="h1" style={{marginTop:10}}>학년 · 연산 선택</h1>
        <p className="p">아이 수준에 맞춰 오늘의 미션 난이도/출제 범위를 조정합니다.</p>
        <div className="hr" />

        <div className="h2">학년</div>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          {[1,2,3,4].map(g=>(
            <button key={g} className={"btn" + (user.grade===g ? " btnPrimary" : "")} onClick={()=>setUser(prev=>({ ...prev, grade: g as any }))}>
              초{g}
            </button>
          ))}
        </div>

        <div className="hr" />
        <div className="h2">연산</div>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          <button className={"btn" + (user.opsEnabled.add ? " btnPrimary" : "")} onClick={()=>toggle("add")}>덧셈</button>
          <button className={"btn" + (user.opsEnabled.sub ? " btnPrimary" : "")} onClick={()=>toggle("sub")}>뺄셈</button>
          <button className={"btn" + (user.opsEnabled.mul ? " btnPrimary" : "")} onClick={()=>toggle("mul")}>곱셈</button>
          <button className={"btn" + (user.opsEnabled.div ? " btnPrimary" : "")} onClick={()=>toggle("div")}>나눗셈</button>
        </div>

        <div className="small" style={{marginTop:10}}>
          ※ 초1~2는 덧셈/뺄셈 중심, 초3~4는 곱셈/나눗셈 비중이 자연스럽게 늘어납니다.
        </div>

        <div className="hr" />
        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
          <button className="btn btnPrimary" onClick={save}>저장</button>
          <Link className="btn" href="/mission/daily">오늘의 미션</Link>
          <Link className="btn btnGhost" href="/">홈</Link>
        </div>
        {saved && <div style={{marginTop:10, color:"var(--good)", fontWeight:900}}>저장 완료</div>}
      </div>
    </main>
  );
}
