import Link from "next/link";

export default function HomePage(){
  return (
    <main className="container">
      <section className="hero">
        <div className="card heroCard cardSoft">
          <div className="pill">오늘 10문제 · 1~3분</div>
          <h1 className="h1 jumbo" style={{marginTop:10}}>매일 앉기 쉬운, 짧고 재밌는 수학 루틴</h1>
          <p className="lead">
            수학펫은 “게임”이 아니라 <b>학습 루틴</b>이에요. 짧게 풀고, 바로 칭찬받고,
            내 펫이 자라는 걸 보면서 매일 습관을 만들어요.
          </p>
          <div style={{display:"flex", gap:10, marginTop:16, flexWrap:"wrap"}}>
            <Link className="btn btnPrimary" href="/mission/daily">오늘의 미션 시작</Link>
            <Link className="btn btnSoft" href="/worksheets/1/add/easy">워크시트 보기</Link>
            <Link className="btn" href="/pet">내 펫 보기</Link>
          </div>
          <div className="kpi" style={{marginTop:16}}>
            <div className="item"><div className="v">초1~초4</div><div className="t">학년 지원</div></div>
            <div className="item"><div className="v">10문제</div><div className="t">데일리 미션</div></div>
            <div className="item"><div className="v">알→부화→진화</div><div className="t">성취 보상</div></div>
          </div>
          <div className="small" style={{marginTop:12}}>
            ※ 워크시트/연습 페이지에만 광고가 표시됩니다. 미션 화면은 광고를 최소화합니다.
          </div>
        </div>

        <div className="heroSide">
          <div className="card heroArt">
            <div style={{textAlign:"center"}}>
              <div className="petBubble">◕ ◕</div>
              <div className="h3" style={{marginTop:6}}>오늘의 펫</div>
              <div className="small">맞힐수록 더 반짝반짝</div>
            </div>
          </div>
          <div className="card cardCool" style={{padding:16}}>
            <div className="h2">부모용 리포트</div>
            <p className="p">정답률·소요시간·취약 연산을 한눈에 확인해요.</p>
            <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
              <Link className="btn btnSecondary" href="/parents">부모용 화면</Link>
              <Link className="btn" href="/settings">학습 설정</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <h2 className="h2">학습 흐름</h2>
          <p className="p">아이 스스로 “앉아서 끝내기” 쉬운 순서로 구성했어요.</p>
        </div>
        <div className="card" style={{padding:16}}>
          <div className="timeline">
            <div className="step">
              <div className="stepNum">1</div>
              <div>
                <div className="h3">오늘의 미션 10문제</div>
                <div className="p">짧게 풀고 바로 끝. 집중 시간은 1~3분입니다.</div>
              </div>
            </div>
            <div className="step">
              <div className="stepNum">2</div>
              <div>
                <div className="h3">정답 보상</div>
                <div className="p">맞힌 만큼 XP가 쌓이고, 알이 부화합니다.</div>
              </div>
            </div>
            <div className="step">
              <div className="stepNum">3</div>
              <div>
                <div className="h3">워크시트/연습 확장</div>
                <div className="p">필요할 때만 더 풀고, 지치지 않게 마무리합니다.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <h2 className="h2">아이 눈높이 화면</h2>
          <p className="p">가독성을 높이고, 오래 봐도 피곤하지 않은 색과 배치로 개선했습니다.</p>
        </div>
        <div className="featureGrid">
          <div className="card featureCard">
            <div className="badge">쉬운 시작</div>
            <div className="h3" style={{marginTop:8}}>큰 버튼, 간단한 선택</div>
            <p className="p">필요한 기능만 크게 보여줘서 헷갈리지 않아요.</p>
          </div>
          <div className="card featureCard cardSoft">
            <div className="badge">반복 학습</div>
            <div className="h3" style={{marginTop:8}}>매일 같은 흐름</div>
            <p className="p">항상 같은 위치에 있어 스스로 학습을 시작합니다.</p>
          </div>
          <div className="card featureCard cardCool">
            <div className="badge">보호자 안심</div>
            <div className="h3" style={{marginTop:8}}>학습 기록 자동 정리</div>
            <p className="p">성과가 보이니 “공부”로 인식하기 쉬워집니다.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
