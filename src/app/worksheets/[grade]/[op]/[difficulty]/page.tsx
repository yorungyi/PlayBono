import Link from "next/link";
import AdSenseSlot from "@/components/AdSenseSlot";

type Params = { grade: string; op: string; difficulty: string };

export function generateStaticParams() {
  const grades = ["1","2","3","4"];
  const ops = ["add","sub","mul","div"];
  const diffs = ["easy","mid","hard"];
  const out: {grade:string; op:string; difficulty:string}[] = [];
  for (const grade of grades) for (const op of ops) for (const difficulty of diffs) out.push({ grade, op, difficulty });
  return out;
}

function clampGrade(g: number){ return g<=1?1:g===2?2:g===3?3:4; }
function opLabel(op: string){
  if(op==="add") return "덧셈";
  if(op==="sub") return "뺄셈";
  if(op==="mul") return "곱셈";
  if(op==="div") return "나눗셈";
  return op;
}
function diffLabel(d: string){
  if(d==="easy") return "쉬움";
  if(d==="mid") return "보통";
  if(d==="hard") return "어려움";
  return d;
}

function genWorksheet(grade:number, op:string, difficulty:string, count=20){
  // server-side deterministic (for SEO): fixed seed by params
  const seedStr = `${grade}|${op}|${difficulty}|ws-v1`;
  let h = 2166136261;
  for (let i=0;i<seedStr.length;i++){ h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  let x = h>>>0;
  const rnd = ()=>{ x ^= x<<13; x ^= x>>>17; x ^= x<<5; return (x>>>0)/4294967296; };

  const max = grade===1? (difficulty==="easy"?20: difficulty==="mid"?30:50)
           : grade===2? (difficulty==="easy"?99: difficulty==="mid"?199:499)
           : grade===3? (difficulty==="easy"?999: difficulty==="mid"?1999:4999)
           : 9999;

  const out: {q:string}[] = [];
  for(let i=0;i<count;i++){
    let a=0,b=0;
    if(op==="add"){ a=Math.floor(rnd()*(max+1)); b=Math.floor(rnd()*Math.max(1, max-a)); out.push({q:`${a} + ${b} =`}); }
    else if(op==="sub"){ a=Math.floor(rnd()*(max+1)); b=Math.floor(rnd()*(max+1)); if(a<b)[a,b]=[b,a]; out.push({q:`${a} - ${b} =`}); }
    else if(op==="mul"){ a = grade<=2 ? [2,3,5][Math.floor(rnd()*3)] : 2+Math.floor(rnd()*8); b=1+Math.floor(rnd()*9); out.push({q:`${a} × ${b} =`}); }
    else { // div
      b=2+Math.floor(rnd()*(grade<=3?7:8)); const q=1+Math.floor(rnd()*9); a=b*q; out.push({q:`${a} ÷ ${b} =`}); }
  }
  return out;
}

export async function generateMetadata({ params }:{ params: Params }) {
  const grade = clampGrade(Number(params.grade));
  const title = `초${grade} ${opLabel(params.op)} 연습문제 (${diffLabel(params.difficulty)}) | 수학펫 워크시트`;
  const description = `초${grade} ${opLabel(params.op)} ${diffLabel(params.difficulty)} 워크시트. 예시 문제 20개와 프린트 기능 제공.`;
  return { title, description };
}

export default function WorksheetPage({ params }:{ params: Params }){
  const grade = clampGrade(Number(params.grade));
  const op = params.op;
  const difficulty = params.difficulty;

  const list = genWorksheet(grade, op, difficulty, 20);

  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT || "";

  return (
    <main className="container">
      <div className="card printArea">
        <div className="noPrint">
          <div className="badge">워크시트</div>
          <h1 className="h1" style={{marginTop:10}}>초{grade} {opLabel(op)} · {diffLabel(difficulty)}</h1>
          <p className="p">
            프린트 가능한 예시 문제 20개입니다. 아래 “오늘의 미션”으로 학습 루틴(부화/진화)을 함께 진행하세요.
          </p>

          <div style={{display:"flex", gap:10, marginTop:14, flexWrap:"wrap"}}>
            <Link className="btn btnPrimary" href="/mission/daily">오늘의 미션 시작</Link>
            <button className="btn" onClick={()=>window.print()}>프린트</button>
            <Link className="btn btnGhost" href={`/practice/${grade}/${op}`}>연습(인터랙티브)</Link>
          </div>

          {adClient && adSlot ? (
            <AdSenseSlot client={adClient} slot={adSlot} nonPersonalized />
          ) : (
            <div className="small" style={{marginTop:12}}>
              ※ AdSense 환경변수(NEXT_PUBLIC_ADSENSE_CLIENT/…SLOT)를 설정하면 이 페이지에만 광고가 표시됩니다.
            </div>
          )}

          <div className="hr" />
        </div>

        <div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:10}}>
            <div style={{fontWeight:900}}>문제</div>
            <div className="small">이름: ____________ · 날짜: ____________</div>
          </div>
          <div className="hr" />
          <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12}}>
            {list.map((x, i)=>(
              <div key={i} style={{padding:"10px 12px", border:"1px solid var(--line)", borderRadius:14}}>
                <div style={{fontWeight:900}}>{String(i+1).padStart(2,"0")}.</div>
                <div style={{fontSize:18, fontWeight:900, marginTop:6}}>{x.q}</div>
              </div>
            ))}
          </div>
          <div className="small" style={{marginTop:16}}>
            ※ 이 페이지는 학습용 콘텐츠입니다. 광고는 학습 콘텐츠 영역에만 제한적으로 노출됩니다.
          </div>
        </div>
      </div>
    </main>
  );
}
