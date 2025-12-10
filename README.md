# 수학펫 (웹 MVP) — Next.js + Firebase

목표: 초1~초4 사칙연산 데일리 10문제(미션) + 알→부화→진화(성취 보상) + 워크시트 SEO(AdSense 수익).

## 1) 로컬 실행
```bash
npm i
cp .env.example .env.local
npm run dev
```

## 2) Firebase 설정
- Firebase Console에서:
  - Authentication: 익명 로그인(Anonymous) 활성화
  - Firestore: Native mode
  - Remote Config: (선택) keys: pass_threshold, xp_per_correct, bonus_perfect

## 3) Firestore Rules 배포
```bash
npm i -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

## 4) Hosting 배포(정적 export)
이 템플릿은 Next.js 정적 export(`out/`) 기준입니다.

```bash
npm run export
firebase init hosting  # public directory: out
firebase deploy --only hosting
```

## 5) AdSense
- /worksheets, /practice 페이지에서만 AdSenseSlot이 렌더링되도록 되어 있습니다.
- NPA(비개인화) 기본값: requestNonPersonalizedAds=1 로 설정합니다.


### 라우팅/SEO
- `next export`는 각 경로별 `index.html`을 생성하므로 Firebase Hosting에서 별도 SPA rewrite 없이도 동작합니다.
