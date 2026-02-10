"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ensureAnonAuth, getDbClient } from "@/lib/firebase";
import { defaultUserDoc, stageLabel, UserDoc } from "@/lib/model";
import { loadLocalUser, loadRewards, PET_SKINS, setActiveSkin, saveLocalUser } from "@/lib/offline";
import PetArt from "@/components/PetArt";

export default function PetPage(){
  const [user, setUser] = useState<UserDoc>(defaultUserDoc);
  const [loading, setLoading] = useState(true);
  const [skin, setSkin] = useState(loadRewards().activeSkin ?? "sunny");
  const [localMode, setLocalMode] = useState(false);

  useEffect(()=>{
    (async ()=>{
      const db = getDbClient();
      if (!db) {
        setLocalMode(true);
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
              <div className={`petSkinWrap skin-${skin}`}>
                <PetArt stage={user.pet.stage} />
              </div>
            </div>
            <div className="col">
              <div className="kpi">
                <div className="item"><div className="v">{stageLabel(user.pet.stage)}</div><div className="t">현재 단계</div></div>
                <div className="item"><div className="v">{user.pet.xp}</div><div className="t">누적 XP</div></div>
                <div className="item"><div className="v">{user.pet.evoPoints}</div><div className="t">진화 포인트</div></div>
                <div className="item"><div className="v">{user.streak.count}일</div><div className="t">연속 미션</div></div>
                <div className="item"><div className="v">{user.pet.generation ?? 1}</div><div className="t">펫 세대</div></div>
              </div>
              <div className="hr" />
              <p className="p">
                다음 진화를 위해서는 <b>정답률</b>과 <b>연속 미션</b>이 모두 필요합니다.
                (학습 루틴을 만들기 위한 설계)
              </p>
              {user.pet.stage === "evo2" && (
                <div style={{marginTop:12}}>
                  <button
                    className="btn btnPrimary"
                    onClick={async ()=>{
                      const nextGen = (user.pet.generation ?? 1) + 1;
                      const updated: UserDoc = {
                        ...user,
                        pet: { stage: "egg", xp: 0, evoPoints: 0, generation: nextGen }
                      };
                      if (localMode) {
                        saveLocalUser(updated);
                        setUser(updated);
                        return;
                      }
                      const db = getDbClient();
                      if (!db) return;
                      const u = await ensureAnonAuth();
                      const userRef = doc(db, "users", u.uid);
                      await updateDoc(userRef, {
                        "pet.stage": "egg",
                        "pet.xp": 0,
                        "pet.evoPoints": 0,
                        "pet.generation": nextGen
                      });
                      setUser(updated);
                    }}
                  >
                    새 펫 키우기 시작
                  </button>
                </div>
              )}
              <div className="hr" />
              <div className="h3">펫 스킨</div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:6}}>
                {PET_SKINS.map(s => {
                  const owned = loadRewards().skins.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      className={"btn" + (skin === s.id ? " btnPrimary" : "")}
                      disabled={!owned}
                      onClick={()=>{
                        if (!owned) return;
                        setActiveSkin(s.id);
                        setSkin(s.id);
                      }}
                    >
                      {s.name}{!owned ? " (잠금)" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
