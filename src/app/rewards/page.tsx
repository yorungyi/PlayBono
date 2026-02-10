"use client";

import Link from "next/link";
import { loadRewards, STICKER_CATALOG } from "@/lib/offline";

export default function RewardsPage(){
  const rewards = loadRewards();
  return (
    <main className="container">
      <div className="card rewardsHeader">
        <div>
          <div className="badge">스티커 보드</div>
          <h1 className="h1" style={{marginTop:8}}>모을수록 반짝반짝!</h1>
          <p className="p">오늘의 미션을 풀면 코인과 스티커를 받아요.</p>
        </div>
        <div className="rewardsCoin">
          <div className="coinLabel">내 코인</div>
          <div className="coinValue">{rewards.coins}</div>
        </div>
      </div>

      <div className="card rewardsBoard">
        <div className="h2">스티커 컬렉션</div>
        <div className="rewardsGrid">
          {STICKER_CATALOG.map((s)=>(
            <div key={s.id} className={"stickerCard" + (rewards.stickers.includes(s.id) ? " owned" : "")}>
              <div className="stickerIcon" style={{background: s.color}} />
              <div className="stickerName">{s.name}</div>
              {!rewards.stickers.includes(s.id) && <div className="stickerLock">잠금</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="card rewardsCTA">
        <div>
          <div className="h2">오늘의 미션을 풀고 스티커 받기</div>
          <p className="p">하루 한 번, 10문제만 풀면 새 스티커가 추가돼요.</p>
        </div>
        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
          <Link className="btn btnPrimary" href="/mission/daily">오늘의 미션</Link>
          <Link className="btn" href="/pet">내 펫 보기</Link>
          <Link className="btn btnGhost" href="/settings">학습 설정</Link>
        </div>
      </div>
    </main>
  );
}
