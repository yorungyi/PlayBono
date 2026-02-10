"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { ensureAnonAuth, getDbClient, getRcNumber } from "@/lib/firebase";
import { defaultUserDoc, stageLabel, nextStage, UserDoc } from "@/lib/model";
import { Difficulty, generateDailyQuestions, ymd } from "@/lib/quiz";
import { DailyDoc, getLocalUid, loadLocalDaily, loadLocalUser, saveLocalDaily, saveLocalUser } from "@/lib/offline";

function clampGrade(n:number): 1|2|3|4 {
  if (n<=1) return 1;
  if (n===2) return 2;
  if (n===3) return 3;
  return 4;
}

export default function DailyMissionPage(){
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string>("");
  const [user, setUser] = useState<UserDoc>(defaultUserDoc);
  const [error, setError] = useState<string | null>(null);
  const [localMode, setLocalMode] = useState(false);

  const [qs, setQs] = useState<DailyDoc["questions"]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<{id:string; userAnswer:number; correct:boolean}[]>([]);
  const [startAt, setStartAt] = useState<number>(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{correct:number; total:number; durationSec:number} | null>(null);

  const today = useMemo(()=>ymd(new Date()), []);

  useEffect(() => {
    (async () => {
      try {
        const db = getDbClient();
        if (!db) {
          const localUid = getLocalUid();
          setUid(localUid);
          setLocalMode(true);

          const localUser = loadLocalUser();
          setUser(localUser);

          const dailyCached = loadLocalDaily(today);
          let daily: DailyDoc;
          if (!dailyCached) {
            const grade = clampGrade(Number(localUser.grade || 1));
            const difficulty: Difficulty = grade <= 2 ? "easy" : grade === 3 ? "mid" : "mid";
            const questions = generateDailyQuestions({
              uid: localUid,
              dateYmd: today,
              grade,
              difficulty,
              opsEnabled: localUser.opsEnabled ?? defaultUserDoc.opsEnabled,
              version: "v1"
            });
            daily = { seed: 0, dateYmd: today, questions };
            saveLocalDaily(daily);
          } else {
            daily = dailyCached;
          }

          setQs(daily.questions);
          setAnswers(daily.answers ?? []);
          setIdx((daily.answers ?? []).length);
          setDone(Boolean(daily.score));
          setResult(daily.score ?? null);
          setStartAt(Date.now());
          setLoading(false);

          (window as any).__PASS = 8;
          (window as any).__XP = 10;
          (window as any).__BONUS = 2;
          return;
        }

        const u = await ensureAnonAuth();
        setUid(u.uid);

        // user doc
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, { ...defaultUserDoc, createdAt: serverTimestamp(), lastSeen: serverTimestamp() });
        } else {
          await updateDoc(userRef, { lastSeen: serverTimestamp() });
        }
        const fresh = await getDoc(userRef);
        const userDoc = (fresh.data() as UserDoc) ?? defaultUserDoc;
        setUser(userDoc);

        // remote config (optional tuning)
        const passThreshold = await getRcNumber("pass_threshold", 8);
        const xpPerCorrect = await getRcNumber("xp_per_correct", 10);
        const bonusPerfect = await getRcNumber("bonus_perfect", 2);

        // daily doc
        const dailyRef = doc(db, "users", u.uid, "daily", today);
        const dSnap = await getDoc(dailyRef);
        let daily: DailyDoc;

        if (!dSnap.exists()) {
          const grade = clampGrade(Number(userDoc.grade || 1));
          const difficulty: Difficulty = grade <= 2 ? "easy" : grade === 3 ? "mid" : "mid";
          const questions = generateDailyQuestions({
            uid: u.uid,
            dateYmd: today,
            grade,
            difficulty,
            opsEnabled: userDoc.opsEnabled ?? defaultUserDoc.opsEnabled,
            version: "v1"
          });
          daily = { seed: 0, dateYmd: today, questions };
          await setDoc(dailyRef, daily);
        } else {
          daily = dSnap.data() as DailyDoc;
        }

        setQs(daily.questions);
        setAnswers(daily.answers ?? []);
        setIdx((daily.answers ?? []).length);
        setDone(Boolean(daily.score));
        setResult(daily.score ?? null);
        setStartAt(Date.now());
        setLoading(false);

        // store config in window for result calc (simple)
        (window as any).__PASS = passThreshold;
        (window as any).__XP = xpPerCorrect;
        (window as any).__BONUS = bonusPerfect;
      } catch (err) {
        console.error(err);
        setError("오늘의 미션을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
        setLoading(false);
      }
    })();
  }, [today]);

  const current = qs[idx];
  const total = qs.length || 10;
  const answered = answers.length;
  const progressPct = total ? Math.min(100, Math.round((answered / total) * 100)) : 0;
  const canSubmit = input.trim().length > 0 && Number.isFinite(Number(input));

  async function submit(){
    if (!current) return;
    const n = Number(input);
    if (!Number.isFinite(n)) return;

    const correct = n === current.answer;
    const next = [...answers, { id: current.id, userAnswer: n, correct }];
    setAnswers(next);
    setInput("");

    if (localMode && idx + 1 < qs.length) {
      saveLocalDaily({ seed: 0, dateYmd: today, questions: qs, answers: next });
    }

    if (idx + 1 >= qs.length) {
      const durationSec = Math.max(1, Math.round((Date.now() - startAt) / 1000));
      const correctCount = next.filter(a => a.correct).length;
      const score = { correct: correctCount, total: qs.length, durationSec };
      setDone(true);
      setResult(score);

      const pass = Number((window as any).__PASS ?? 8);
      const xpPer = Number((window as any).__XP ?? 10);
      const bonusPerfect = Number((window as any).__BONUS ?? 2);

      const addXp = correctCount * xpPer;
      const evoGain = correctCount >= pass ? 1 : 0;
      const perfectGain = correctCount === qs.length ? bonusPerfect : 0;

      // streak: if lastDailyDate == yesterday? keep; else reset to 1
      const yesterday = (() => {
        const d = new Date();
        d.setDate(d.getDate()-1);
        return ymd(d);
      })();

      const prevLast = user.streak?.lastDailyDate ?? "";
      const prevCount = user.streak?.count ?? 0;
      const newStreak = (prevLast === yesterday) ? (prevCount + 1) : 1;

      // evolve check (simple thresholds)
      let stage = user.pet?.stage ?? "egg";
      let evoPoints = (user.pet?.evoPoints ?? 0) + evoGain + perfectGain;
      const xp = (user.pet?.xp ?? 0) + addXp;

      const thresholds = [
        { stage: "egg", needEvo: 3, needStreak: 2 },
        { stage: "hatch", needEvo: 8, needStreak: 5 },
        { stage: "evo1", needEvo: 15, needStreak: 10 },
      ] as const;

      const t = thresholds.find(x => x.stage === stage);
      if (t && evoPoints >= t.needEvo && newStreak >= t.needStreak) {
        stage = nextStage(stage as any) as any;
      }

      if (localMode) {
        const dailyLocal = { seed: 0, dateYmd: today, questions: qs, answers: next, score };
        saveLocalDaily(dailyLocal);
        const updatedUser = {
          ...user,
          pet: { ...user.pet, stage: stage as any, xp, evoPoints },
          streak: { count: newStreak, lastDailyDate: today }
        };
        saveLocalUser(updatedUser);
        setUser(updatedUser);
        return;
      }

      const db = getDbClient();
      if (!db) return;

      // persist daily result
      const dailyRef = doc(db, "users", uid, "daily", today);
      await updateDoc(dailyRef, { answers: next, score });

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        "pet.stage": stage,
        "pet.xp": xp,
        "pet.evoPoints": evoPoints,
        "streak.count": newStreak,
        "streak.lastDailyDate": today,
        lastSeen: serverTimestamp(),
      });

      setUser((prev)=>({
        ...prev,
        pet: { ...prev.pet, stage: stage as any, xp, evoPoints },
        streak: { count: newStreak, lastDailyDate: today }
      }));
      return;
    }

    setIdx(idx + 1);
  }

  if (loading) {
    return (
      <main className="container">
        <div className="card missionLoading">
          <div className="badge">오늘의 미션</div>
          <div className="h2" style={{marginTop:10}}>문제를 준비 중이에요</div>
          <p className="p">학년/연산 설정을 불러오고 있어요.</p>
          <div className="missionSkeleton">
            <div className="bone" />
            <div className="bone" />
            <div className="bone" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <div className="card missionError">
          <div className="badge">앗!</div>
          <h1 className="h1" style={{marginTop:10}}>화면을 불러오지 못했어요</h1>
          <p className="p">{error}</p>
          <div style={{display:"flex", gap:10, marginTop:14, flexWrap:"wrap"}}>
            <button className="btn btnPrimary" onClick={()=>window.location.reload()}>다시 시도</button>
            <Link className="btn" href="/settings">설정 확인</Link>
            <Link className="btn btnGhost" href="/">홈으로</Link>
          </div>
        </div>
      </main>
    );
  }

  if (done && result) {
    const pass = Number((window as any).__PASS ?? 8);
    return (
      <main className="container">
        <div className="card missionResult">
          <div className="badge">미션 완료!</div>
          <h1 className="h1" style={{marginTop:10}}>{result.correct}/{result.total} 정답</h1>
          <p className="p">소요 시간: {result.durationSec}초 · 기준: {pass}개 이상 통과</p>
          <div className="missionStars">
            {Array.from({length: Math.max(1, Math.min(5, Math.round((result.correct / result.total) * 5)))}).map((_, i)=>(
              <span key={i} className="star">★</span>
            ))}
          </div>
          <div className="hr" />
          <div className="kpi">
            <div className="item"><div className="v">{stageLabel(user.pet.stage)}</div><div className="t">현재 단계</div></div>
            <div className="item"><div className="v">{user.pet.evoPoints}</div><div className="t">진화 포인트</div></div>
            <div className="item"><div className="v">{user.streak.count}일</div><div className="t">연속 미션</div></div>
          </div>

          <div style={{display:"flex", gap:10, marginTop:14, flexWrap:"wrap"}}>
            <Link className="btn btnPrimary" href="/pet">펫 보러가기</Link>
            <Link className="btn" href="/worksheets/1/add/easy">워크시트 풀기</Link>
            <Link className="btn btnGhost" href="/parents">부모용 리포트</Link>
          </div>

          <div className="small" style={{marginTop:12}}>
            ※ 미션 화면은 광고를 최소화합니다. 광고는 학습 콘텐츠(워크시트/연습)에서만 표시됩니다.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="missionWrap">
        <div className="card missionHeaderCard">
          <div className="missionHeaderTop">
            <div>
              <div className="badge">오늘의 미션</div>
              <h1 className="h1" style={{marginTop:8}}>하루 10문제 챌린지!</h1>
              <p className="p">문제를 풀면 펫이 성장해요. 오늘도 한 단계 더!</p>
            </div>
            <div className="missionStamp">D-{total - answered}</div>
          </div>
          <div className="missionProgress">
            <div className="missionProgressBar">
              <span style={{width:`${progressPct}%`}} />
            </div>
            <div className="missionProgressMeta">{answered}/{total} 완료</div>
          </div>
          <div className="missionDots">
            {Array.from({length: total}).map((_, i)=>(
              <span key={i} className={"dot" + (i < answered ? " on" : "")} />
            ))}
          </div>
        </div>

        <div className="grid2">
          <div className="card missionQuestionCard">
            <div className="badge">문제 {idx+1} / {total}</div>
            <div className="missionQuestion">
              <div className="missionBubble">준비!</div>
              <div className="missionText">{current?.text ?? "문제를 불러오는 중이에요."}</div>
            </div>

            <div className="missionAnswerRow">
              <input
                className="input missionInput"
                inputMode="numeric"
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                placeholder="정답 입력"
                onKeyDown={(e)=>{ if (e.key==="Enter" && canSubmit) submit(); }}
                aria-label="정답 입력"
              />
              <button className="btn btnPrimary missionSubmit" onClick={submit} disabled={!canSubmit}>제출</button>
            </div>

            <div className="missionTip">
              팁: 차근차근 계산해도 괜찮아요. 정확하게 맞히는 것이 목표입니다.
            </div>
          </div>

          <div className="card missionSideCard">
            <div className="h2">학습 상태</div>
            <div className="kpi">
              <div className="item"><div className="v">초{user.grade}</div><div className="t">학년</div></div>
              <div className="item"><div className="v">{stageLabel(user.pet.stage)}</div><div className="t">펫 단계</div></div>
              <div className="item"><div className="v">{user.streak.count}일</div><div className="t">연속</div></div>
            </div>
            <div className="hr" />
            <div className="badge">정답 기록</div>
            <div style={{marginTop:10}}>
              {answers.length === 0 ? (
                <p className="p">아직 기록이 없습니다.</p>
              ) : (
                <div className="missionMarks">
                  {answers.map((a)=>(
                    <span key={a.id} className={"mark " + (a.correct ? "ok" : "no")}>
                      {a.correct ? "O" : "X"}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="hr" />
            <Link className="btn" href="/worksheets/1/add/easy">학습 콘텐츠(워크시트)로 이동</Link>
            <div className="small" style={{marginTop:10}}>
              ※ 미션은 집중이 핵심이라, 광고를 최소화합니다.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
