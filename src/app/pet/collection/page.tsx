"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PetArt from "@/components/PetArt";
import { defaultUserDoc, UserDoc } from "@/lib/model";
import { ensureAnonAuth, getDbClient } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { loadLocalUser } from "@/lib/offline";

export default function PetCollectionPage(){
  const [user, setUser] = useState<UserDoc>(defaultUserDoc);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      const db = getDbClient();
      if (!db) {
        setUser(loadLocalUser());
        setLoading(false);
        return;
      }
      const u = await ensureAnonAuth();
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) setUser(snap.data() as UserDoc);
      setLoading(false);
    })();
  }, []);

  const history = user.petHistory ?? [];

  return (
    <main className="container">
      <div className="card" style={{padding:18}}>
        <div className="badge">펫 컬렉션</div>
        <h1 className="h1" style={{marginTop:10}}>지금까지 키운 펫</h1>
        <p className="p">세대별로 성장 기록을 모아두었어요.</p>
        <div className="hr" />
        {loading ? (
          <p className="p">불러오는 중…</p>
        ) : (
          <div className="petGallery">
            <div className="petCard">
              <PetArt stage={user.pet.stage} species={user.pet.species ?? "chick"} size={120} />
              <div className="petMeta">현재 세대 {user.pet.generation ?? 1}</div>
            </div>
            {history.map((h)=>(
              <div key={`${h.generation}-${h.species}-${h.completedAt}`} className="petCard">
                <PetArt stage="evo2" species={h.species} size={110} />
                <div className="petMeta">세대 {h.generation} · {h.completedAt}</div>
              </div>
            ))}
          </div>
        )}
        <div className="hr" />
        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
          <Link className="btn btnPrimary" href="/pet">내 펫</Link>
          <Link className="btn" href="/mission/daily">오늘의 미션</Link>
          <Link className="btn btnGhost" href="/">홈</Link>
        </div>
      </div>
    </main>
  );
}
