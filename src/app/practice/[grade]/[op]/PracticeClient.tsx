"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdSenseSlot from "@/components/AdSenseSlot";

function clampGrade(g:number){ return g<=1?1:g===2?2:g===3?3:4; }
function opLabel(op: string){
  if(op==="add") return "덧셈";
  if(op==="sub") return "뺄셈";
  if(op==="mul") return "곱셈";
  if(op==="div") return "나눗셈";
  return op;
}

function genOne(grade:number, op:string){
  const max = grade===1?20 : grade===2?99 : grade===3?999 : 9999;
  const r = Math.random;
  let a=0,b=0,ans=0,text="";
  if(op==="add"){ a=Math.floor(r()*(max+1)); b=Math.floor(r()*(max+1)); ans=a+b; text=`${a} + ${b}`; }
  else if(op==="sub"){ a=Math.floor(r()*(max+1)); b=Math.floor(r()*(max+1)); if(a<b)[a,b]=[b,a]; ans=a-b; text=`${a} - ${b}`; }
  else if(op==="mul"){ a = grade<=2 ? [2,3,5][Math.floor(r()*3)] : 2+Math.floor(r()*8); b=1+Math.floor(r()*9); ans=a*b; text=`${a} × ${b}`; }
  else { b=2+Math.floor(r()*(grade<=3?7:8)); const q=1+Math.floor(r()*9); a=b*q; ans=q; text=`${a} ÷ ${b}`; }
  return { a,b,ans,text };
}

export default function PracticeClient({ params }:{ params:{ grade:string; op:string } }){
  const grade = clampGrade(Number(params.grade));
  const op = params.op;

  const [q, setQ] = useState(()=>genOne(grade, op));
  const [v, setV] = useState("");
  const [msg, setMsg] = useState<string|undefined>();

  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT || "";

  function check(){
    const n = Number(v);
    if(!Number.isFinite(n)) return;
    if(n === q.ans){
      setMsg("정답입니다! 다음 문제로 넘어가요.");
      setTimeout(()=>{ setQ(genOne(grade, op)); setV(""); setMsg(undefined); }, 450);
    } else {
      setMsg("다시 한 번 생각해 봐요.");
    }
  }

  return (
    <main className="container">
      <div className="card" style={{padding:18}}>
        <div className="badge">연습</div>
        <h1 className="h1" style={{marginTop:10}}>초{grade} {opLabel(op)} 연습</h1>
        <p className="p">
          이 페이지는 “학습 콘텐츠”로 구성된 짧은 연습입니다. 집중이 필요한 “오늘의 미션”은 별도 화면에서 진행됩니다.
        </p>

        <div style={{display:"flex", gap:10, marginTop:14, flexWrap:"wrap"}}>
          <Link className="btn btnPrimary" href="/mission/daily">오늘의 미션</Link>
          <Link className="btn" href={`/worksheets/${grade}/${op}/easy`}>워크시트</Link>
        </div>

        {adClient && adSlot ? (
          <AdSenseSlot client={adClient} slot={adSlot} nonPersonalized />
        ) : (
          <div className="small" style={{marginTop:12}}>
            ※ AdSense 환경변수 설정 시(클라이언트/슬롯), 이 학습 콘텐츠 페이지에만 광고가 표시됩니다.
          </div>
        )}

        <div className="hr" />
        <div style={{fontSize:26, fontWeight:900}}>{q.text} = ?</div>
        <div style={{display:"flex", gap:10, marginTop:12}}>
          <input className="input" inputMode="numeric" value={v} onChange={(e)=>setV(e.target.value)} onKeyDown={(e)=>{ if(e.key==="Enter") check(); }} />
          <button className="btn btnPrimary" onClick={check}>확인</button>
        </div>
        {msg && <div style={{marginTop:12, fontWeight:900}}>{msg}</div>}

        <div className="hr" />
        <div className="small">
          ※ 광고는 학습 콘텐츠 영역에만 제한적으로 노출합니다. 미션(게임 UI)은 별도로 운영하세요.
        </div>
      </div>
    </main>
  );
}
