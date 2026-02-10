import { test, expect } from "@playwright/test";

const LS_KEY = "playbono:v1";

function defaultState() {
  return {
    uid: "test",
    user: {
      grade: 1,
      opsEnabled: { add: true, sub: true, mul: true, div: true },
      pet: { stage: "egg", xp: 0, evoPoints: 0, generation: 1, species: "chick" },
      petHistory: [],
      streak: { count: 0, lastDailyDate: "" },
    },
    daily: {},
    rewards: {
      coins: 0,
      stickers: [],
      lastDailyRewardYmd: "",
      skins: ["sunny"],
      activeSkin: "sunny",
      logs: [],
      badges: [],
    },
    goals: { dailyQuestions: 10, weeklySessions: 3 },
    quests: {
      daily: { dateYmd: "", completed: false, perfect: false },
      weekly: { weekId: "", sessions: 0 },
      season: { seasonId: "", xp: 0 },
    },
  };
}

async function setLocalState(page: any, state: any) {
  await page.addInitScript(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [LS_KEY, state]);
}

function solve(text: string) {
  const m = text.match(/(\\d+)\\s*([+\\-×÷])\\s*(\\d+)/);
  if (!m) return null;
  const a = Number(m[1]);
  const op = m[2];
  const b = Number(m[3]);
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "×") return a * b;
  if (op === "÷") return Math.floor(a / b);
  return null;
}

test("home renders and shows pet card", async ({ page }) => {
  await setLocalState(page, defaultState());
  await page.goto("/");
  await expect(page.getByRole("link", { name: "오늘의 미션 시작" })).toBeVisible();
  await expect(page.getByText("오늘의 펫")).toBeVisible();
});

test("daily mission awards coins and updates quests/season", async ({ page }) => {
  await setLocalState(page, defaultState());
  await page.goto("/mission/daily");

  const input = page.locator('input[aria-label="정답 입력"]');
  for (let i = 0; i < 10; i++) {
    const text = await page.locator(".missionText").innerText();
    const ans = solve(text);
    if (ans === null) throw new Error(`Cannot parse question: ${text}`);
    await input.fill(String(ans));
    await page.getByRole("button", { name: "제출" }).click();
  }

  await expect(page.getByText("미션 완료!")).toBeVisible();

  const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "{}"), LS_KEY);
  expect(state.rewards.coins).toBeGreaterThan(0);
  expect(state.quests.daily.completed).toBeTruthy();
  expect(state.quests.season.xp).toBeGreaterThan(0);
});

test("rewards page shows coins and sticker images", async ({ page }) => {
  await setLocalState(page, defaultState());
  await page.goto("/mission/daily");
  const input = page.locator('input[aria-label="정답 입력"]');
  for (let i = 0; i < 10; i++) {
    const text = await page.locator(".missionText").innerText();
    const ans = solve(text);
    if (ans === null) throw new Error(`Cannot parse question: ${text}`);
    await input.fill(String(ans));
    await page.getByRole("button", { name: "제출" }).click();
  }
  await page.goto("/rewards");
  await expect(page.getByText("내 코인")).toBeVisible();
  const coinValue = await page.locator(".coinValue").innerText();
  expect(Number(coinValue)).toBeGreaterThan(0);
  await expect(page.locator(".stickerIcon img").first()).toBeVisible();
});

test("pet can start new generation and history is recorded", async ({ page }) => {
  const state = defaultState();
  state.user.pet.stage = "evo2";
  state.user.pet.generation = 1;
  await setLocalState(page, state);

  await page.goto("/pet");
  await page.getByRole("button", { name: "새 펫 키우기 시작" }).click();
  await page.getByRole("button", { name: "고양이" }).click();

  await expect(page.getByText("펫 종류")).toBeVisible();
  await expect(page.getByText("고양이")).toBeVisible();

  await page.goto("/pet/collection");
  await expect(page.getByText("세대 1")).toBeVisible();
});

