"use client";

import { useMemo, useState } from "react";

export default function ParentGate({ onPass }:{ onPass:()=>void }) {
  const q = useMemo(() => {
    const a = 10 + Math.floor(Math.random()*40);
    const b = 10 + Math.floor(Math.random()*40);
    return { a, b, ans: a + b };
  }, []);
  const [v, setV] = useState("");
  const [err, setErr] = useState<string|undefined>();

  function submit(){
    const n = Number(v);
    if (Number.isFinite(n) && n === q.ans){
      onPass();
    } else {
      setErr("정답이 아닙니다. 다시 입력해 주세요.");
    }
  }

  return (
    <div className="card" style={{padding:16}}>
      <div className="h2">부모 확인</div>
      <p className="p">부모님만 들어갈 수 있는 화면입니다. 아래 계산을 입력해 주세요.</p>
      <div className="hr" />
      <div className="badge">문제</div>
      <div style={{fontSize:18, fontWeight:900, marginTop:8}}>{q.a} + {q.b} = ?</div>
      <div style={{display:"flex", gap:10, marginTop:10}}>
        <input className="input" inputMode="numeric" value={v} onChange={(e)=>setV(e.target.value)} placeholder="정답 입력" />
        <button className="btn btnPrimary" onClick={submit}>확인</button>
      </div>
      {err && <div style={{marginTop:10, color:"var(--bad)", fontWeight:800}}>{err}</div>}
      <div className="small" style={{marginTop:12}}>※ 개인정보/결제/광고 클릭 유도는 하지 않습니다.</div>
    </div>
  );
}
