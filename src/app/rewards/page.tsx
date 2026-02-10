"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getDailyShop, loadRewards, buySticker, STICKER_CATALOG, PET_SKINS, buySkin, setActiveSkin } from "@/lib/offline";
import { ymd } from "@/lib/quiz";

export default function RewardsPage(){
  const [rewards, setRewards] = useState(loadRewards());
  const [theme, setTheme] = useState<"space"|"ocean"|"forest">("space");
  const [toast, setToast] = useState<string | null>(null);
  const today = useMemo(()=>ymd(new Date()), []);
  const shopItems = useMemo(()=>getDailyShop(today, 3), [today]);

  function showToast(msg: string){
    setToast(msg);
    setTimeout(()=>setToast(null), 1200);
  }

  function handleBuy(id: string, price: number){
    const res = buySticker(id, price);
    if (!res.ok) {
      showToast("코인이 부족해요!");
      return;
    }
    setRewards(res.rewards);
    showToast("스티커 획득!");
  }

  function handleBuySkin(id: string, price: number){
    const res = buySkin(id, price);
    if (!res.ok) {
      showToast("코인이 부족해요!");
      return;
    }
    setRewards(res.rewards);
    showToast("스킨 획득!");
  }

  function handleEquipSkin(id: string){
    const updated = setActiveSkin(id);
    setRewards(updated);
    showToast("스킨 적용!");
  }

  const stickers = STICKER_CATALOG.filter(s => s.theme === theme);
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

      <div className={`card rewardsBoard theme-${theme}`}>
        <div className="rewardsTabs">
          <button className={"btn" + (theme === "space" ? " btnPrimary" : "")} onClick={()=>setTheme("space")}>우주</button>
          <button className={"btn" + (theme === "ocean" ? " btnPrimary" : "")} onClick={()=>setTheme("ocean")}>바다</button>
          <button className={"btn" + (theme === "forest" ? " btnPrimary" : "")} onClick={()=>setTheme("forest")}>숲</button>
        </div>
        <div className="h2" style={{marginTop:10}}>스티커 컬렉션</div>
        <div className="rewardsGrid">
          {stickers.map((s)=>(
            <div key={s.id} className={"stickerCard" + (rewards.stickers.includes(s.id) ? " owned" : "")}>
              <div className="stickerIcon" style={{background: s.color}} />
              <div className="stickerName">{s.name}</div>
              {!rewards.stickers.includes(s.id) && <div className="stickerLock">잠금</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="card rewardsShop">
        <div>
          <div className="badge">오늘의 상점</div>
          <h2 className="h2" style={{marginTop:6}}>오늘의 스티커 3종</h2>
          <p className="p">코인으로 원하는 스티커를 바로 살 수 있어요.</p>
        </div>
        <div className="shopGrid">
          {shopItems.map(item => {
            const sticker = STICKER_CATALOG.find(s => s.id === item.id);
            if (!sticker) return null;
            const owned = rewards.stickers.includes(item.id);
            return (
              <div key={item.id} className="shopCard">
                <div className="shopIcon" style={{background: sticker.color}} />
                <div className="shopName">{sticker.name}</div>
                <div className="shopPrice">{item.price} 코인</div>
                <button className="btn btnPrimary" disabled={owned} onClick={()=>handleBuy(item.id, item.price)}>
                  {owned ? "보유 중" : "구매"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card rewardsShop">
        <div>
          <div className="badge">펫 상점</div>
          <h2 className="h2" style={{marginTop:6}}>귀여운 스킨으로 꾸며요</h2>
          <p className="p">코인으로 스킨을 구매하고 바로 적용할 수 있어요.</p>
        </div>
        <div className="shopGrid">
          {PET_SKINS.map(s => {
            const owned = rewards.skins.includes(s.id);
            const active = rewards.activeSkin === s.id;
            return (
              <div key={s.id} className="shopCard">
                <div className="shopIcon" style={{background: s.color}} />
                <div className="shopName">{s.name}</div>
                <div className="shopPrice">{s.price} 코인</div>
                {owned ? (
                  <button className={"btn" + (active ? " btnPrimary" : "")} onClick={()=>handleEquipSkin(s.id)}>
                    {active ? "사용 중" : "적용"}
                  </button>
                ) : (
                  <button className="btn btnPrimary" onClick={()=>handleBuySkin(s.id, s.price)}>구매</button>
                )}
              </div>
            );
          })}
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
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
