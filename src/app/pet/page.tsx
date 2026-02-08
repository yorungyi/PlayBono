"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { ensureAnonAuth, getDbClient } from "@/lib/firebase";
import { defaultUserDoc, stageLabel, UserDoc } from "@/lib/model";

function PetArt({stage}:{stage:string}){
  const size = 140;
  const bg = stage === "egg" ? "#e0f2fe" : stage === "hatch" ? "#dcfce7" : stage === "evo1" ? "#fef9c3" : "#ffe4e6";
  const eye = stage === "egg" ? "…" : stage === "hatch" ? "• •" : stage === "evo1" ? "◕ ◕" : "★ ★";
  const mouth = stage === "egg" ? "" : stage === "hatch" ? "ᴗ" : "▽";
  return (
    <div className="center" style={{
      width:size, height:size, borderRadius:28, background:bg, border:"1px solid #e5e7eb", boxShadow:"var(--shadow)"
    }}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:34, fontWeight:900}}>{eye}</div>
        <div style={{fontSize:28, fontWeight:900}}>{mouth}</div>
      </div>
    </div>
  );
}

export default function PetPage(){
  const [user, setUser] = useState<UserDoc>(defaultUserDoc);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      const db = getDbClient();
      if (!db) {
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

  return (
    <main className="container">
      <div className="card" style={{padding:18}}>
        <div className="badge">펫</div>
        <h1 className="h1" style={{marginTop:10}}>알 → 부화 → 진화</h1>
        <p className="p">학습 성취(정답·연속 미션)로 성장합니다.</p>
        <div className="hr" />
        {loading ? (
          <p className="p">불러오는 중…</p>
        ) : (
          <div className="row">
            <div className="col">
              <PetArt stage={user.pet.stage} />
            </div>
            <div className="col">
              <div className="kpi">
                <div className="item"><div className="v">{stageLabel(user.pet.stage)}</div><div className="t">현재 단계</div></div>
                <div className="item"><div className="v">{user.pet.xp}</div><div className="t">누적 XP</div></div>
                <div className="item"><div className="v">{user.pet.evoPoints}</div><div className="t">진화 포인트</div></div>
                <div className="item"><div className="v">{user.streak.count}일</div><div className="t">연속 미션</div></div>
              </div>
              <div className="hr" />
              <p className="p">
                다음 진화를 위해서는 <b>정답률</b>과 <b>연속 미션</b>이 모두 필요합니다.
                (학습 루틴을 만들기 위한 설계)
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
