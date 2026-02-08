import Link from "next/link";

export default function HomePage(){
  return (
    <main className="container">
      <div className="grid2">
        <div className="card" style={{padding:18}}>
          <h1 className="h1">오늘 10문제로, 매일 꾸준히</h1>
          <p className="p">
            수학펫은 “게임”이 아니라 <b>학습 루틴</b>입니다. 짧게(1~3분), 정확하게(사칙연산), 꾸준하게(부화/진화).
          </p>
          <div className="hr" />
          <div className="kpi">
            <div className="item"><div className="v">초1~초4</div><div className="t">학년 지원</div></div>
            <div className="item"><div className="v">10문제</div><div className="t">데일리 미션</div></div>
            <div className="item"><div className="v">알→부화→진화</div><div className="t">성취 보상</div></div>
          </div>
          <div style={{display:"flex", gap:10, marginTop:14, flexWrap:"wrap"}}>
            <Link className="btn btnPrimary" href="/mission/daily">오늘의 미션 시작</Link>
            <Link className="btn" href="/worksheets/1/add/easy">워크시트 보기</Link>
            <Link className="btn btnGhost" href="/settings">설정</Link>
            <Link className="btn btnGhost" href="/parents">부모용 리포트</Link>
          </div>
          <div className="small" style={{marginTop:12}}>
            ※ 워크시트/연습 페이지에만 광고가 표시됩니다. 미션(문제풀이 화면)은 광고를 최소화합니다.
          </div>
        </div>

        <div className="card" style={{padding:18}}>
          <div className="h2">빠른 시작</div>
          <ol className="p" style={{paddingLeft:18}}>
            <li>오늘의 미션(10문제)을 풉니다.</li>
            <li>8개 이상 맞히면 “진화 포인트”를 받습니다.</li>
            <li>포인트가 쌓이면 알이 부화하고, 더 강하게 진화합니다.</li>
          </ol>
          <div className="hr" />
          <div className="badge">학습이 ‘보이게’</div>
          <p className="p" style={{marginTop:10}}>
            부모용 화면에서 <b>정답률/소요시간/취약 연산</b>을 확인할 수 있어 “게임”이 아닌 “공부”로 인식됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
