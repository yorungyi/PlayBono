import { defaultUserDoc, UserDoc } from "@/lib/model";
import type { Op } from "@/lib/quiz";

export type DailyDoc = {
  seed: number;
  dateYmd: string;
  questions: { id:string; op:Op; a:number; b:number; text:string; answer:number }[];
  answers?: { id:string; userAnswer:number; correct:boolean }[];
  score?: { correct:number; total:number; durationSec:number };
};

export type RewardState = {
  coins: number;
  stickers: string[];
  lastDailyRewardYmd?: string;
  skins: string[];
  activeSkin?: string;
  logs: RewardLog[];
  badges: string[];
};

export type ParentGoals = {
  dailyQuestions: number;
  weeklySessions: number;
};

export type QuestState = {
  daily: {
    dateYmd: string;
    completed: boolean;
    perfect: boolean;
  };
  weekly: {
    weekId: string;
    sessions: number;
  };
  season: {
    seasonId: string;
    xp: number;
  };
};

export type RewardLog = {
  id: string;
  type: "daily" | "sticker" | "skin";
  title: string;
  dateYmd: string;
  coins?: number;
  stickerId?: string;
  skinId?: string;
};

export const BADGES: { id: string; name: string; desc: string; icon: string }[] = [
  { id: "first", name: "첫 도전", desc: "미션 첫 완료!", icon: "🌟" },
  { id: "perfect", name: "완벽 10개", desc: "10문제 모두 정답!", icon: "🏆" },
  { id: "streak3", name: "3일 연속", desc: "연속 3일 달성", icon: "🔥" },
  { id: "streak7", name: "7일 연속", desc: "연속 7일 달성", icon: "🚀" },
];

export const PET_SKINS: { id: string; name: string; price: number; color: string; accent: string }[] = [
  { id: "sunny", name: "햇살", price: 12, color: "#fde68a", accent: "#fbbf24" },
  { id: "sky", name: "하늘", price: 14, color: "#bae6fd", accent: "#60a5fa" },
  { id: "mint", name: "민트", price: 14, color: "#bbf7d0", accent: "#34d399" },
  { id: "berry", name: "베리", price: 16, color: "#fecaca", accent: "#fb7185" },
  { id: "grape", name: "포도", price: 16, color: "#ddd6fe", accent: "#a78bfa" },
];

export const STICKER_CATALOG: { id: string; name: string; color: string; theme: "ocean"|"space"|"forest"; image: string }[] = [
  { id: "star", name: "반짝별", color: "#ffd166", theme: "space", image: "/stickers/star.svg" },
  { id: "rocket", name: "로켓", color: "#fca5a5", theme: "space", image: "/stickers/rocket.svg" },
  { id: "planet", name: "행성", color: "#c4b5fd", theme: "space", image: "/stickers/planet.svg" },
  { id: "cloud", name: "구름", color: "#a5f3fc", theme: "space", image: "/stickers/cloud.svg" },
  { id: "balloon", name: "풍선", color: "#fcd34d", theme: "forest", image: "/stickers/balloon.svg" },
  { id: "leaf", name: "잎새", color: "#86efac", theme: "forest", image: "/stickers/leaf.svg" },
  { id: "puzzle", name: "퍼즐", color: "#f9a8d4", theme: "forest", image: "/stickers/puzzle.svg" },
  { id: "crown", name: "왕관", color: "#fbbf24", theme: "forest", image: "/stickers/crown.svg" },
  { id: "fish", name: "물고기", color: "#93c5fd", theme: "ocean", image: "/stickers/fish.svg" },
  { id: "gem", name: "보석", color: "#a7f3d0", theme: "ocean", image: "/stickers/gem.svg" },
  { id: "dice", name: "주사위", color: "#fdba74", theme: "ocean", image: "/stickers/dice.svg" },
  { id: "music", name: "음표", color: "#fda4af", theme: "forest", image: "/stickers/music.svg" },
];

type LocalState = {
  uid: string;
  user: UserDoc;
  daily: Record<string, DailyDoc>;
  rewards: RewardState;
  goals: ParentGoals;
  quests: QuestState;
};

const LS_KEY = "playbono:v1";
const defaultRewards: RewardState = { coins: 0, stickers: [], lastDailyRewardYmd: "", skins: ["sunny"], activeSkin: "sunny", logs: [], badges: [] };
const defaultGoals: ParentGoals = { dailyQuestions: 10, weeklySessions: 3 };

function weekIdFor(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((t.getTime() - yearStart.getTime())/86400000)+1)/7);
  return `${t.getUTCFullYear()}-W${String(weekNo).padStart(2,"0")}`;
}

function seasonIdFor(d: Date) {
  const y = d.getFullYear();
  const q = Math.floor(d.getMonth()/3) + 1;
  return `${y}-S${q}`;
}

function readState(): LocalState {
  if (typeof window === "undefined") {
    return { uid: "local", user: defaultUserDoc, daily: {}, rewards: defaultRewards, goals: defaultGoals, quests: {
      daily: { dateYmd: "", completed: false, perfect: false },
      weekly: { weekId: "", sessions: 0 },
      season: { seasonId: "", xp: 0 }
    }};
  }
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    const fresh: LocalState = { uid: makeUid(), user: defaultUserDoc, daily: {}, rewards: defaultRewards, goals: defaultGoals, quests: {
      daily: { dateYmd: "", completed: false, perfect: false },
      weekly: { weekId: "", sessions: 0 },
      season: { seasonId: "", xp: 0 }
    }};
    localStorage.setItem(LS_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw) as LocalState;
    if (!parsed.uid) parsed.uid = makeUid();
    if (!parsed.user) parsed.user = defaultUserDoc;
    if (!parsed.daily) parsed.daily = {};
    if (!parsed.rewards) parsed.rewards = defaultRewards;
    if (!parsed.rewards.logs) parsed.rewards.logs = [];
    if (!parsed.rewards.skins) parsed.rewards.skins = ["sunny"];
    if (!parsed.rewards.activeSkin) parsed.rewards.activeSkin = "sunny";
    if (!parsed.rewards.badges) parsed.rewards.badges = [];
    if (!parsed.goals) parsed.goals = defaultGoals;
    if (!parsed.quests) {
      parsed.quests = {
        daily: { dateYmd: "", completed: false, perfect: false },
        weekly: { weekId: "", sessions: 0 },
        season: { seasonId: "", xp: 0 }
      };
    }
    return parsed;
  } catch {
    const fresh: LocalState = { uid: makeUid(), user: defaultUserDoc, daily: {}, rewards: defaultRewards, goals: defaultGoals, quests: {
      daily: { dateYmd: "", completed: false, perfect: false },
      weekly: { weekId: "", sessions: 0 },
      season: { seasonId: "", xp: 0 }
    }};
    localStorage.setItem(LS_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function writeState(state: LocalState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function makeUid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function getLocalUid(): string {
  const state = readState();
  return state.uid;
}

export function loadLocalUser(): UserDoc {
  const state = readState();
  return state.user ?? defaultUserDoc;
}

export function saveLocalUser(user: UserDoc) {
  const state = readState();
  state.user = user;
  writeState(state);
}

export function loadLocalDaily(dateYmd: string): DailyDoc | null {
  const state = readState();
  return state.daily[dateYmd] ?? null;
}

export function saveLocalDaily(daily: DailyDoc) {
  const state = readState();
  state.daily[daily.dateYmd] = daily;
  writeState(state);
}

export function listLocalDaily(limit = 7): DailyDoc[] {
  const state = readState();
  const items = Object.values(state.daily);
  items.sort((a, b) => (a.dateYmd > b.dateYmd ? -1 : a.dateYmd < b.dateYmd ? 1 : 0));
  return items.slice(0, limit);
}

export function loadRewards(): RewardState {
  const state = readState();
  return state.rewards ?? defaultRewards;
}

export function loadGoals(): ParentGoals {
  const state = readState();
  return state.goals ?? defaultGoals;
}

export function saveGoals(goals: ParentGoals) {
  const state = readState();
  state.goals = goals;
  writeState(state);
}

export function loadQuests(): QuestState {
  const state = readState();
  return state.quests;
}

export function saveQuests(quests: QuestState) {
  const state = readState();
  state.quests = quests;
  writeState(state);
}

export function saveRewards(rewards: RewardState) {
  const state = readState();
  state.rewards = rewards;
  writeState(state);
}

export function addCoins(amount: number) {
  const state = readState();
  state.rewards.coins = Math.max(0, state.rewards.coins + amount);
  writeState(state);
  return state.rewards;
}

export function addSticker(id: string) {
  const state = readState();
  if (!state.rewards.stickers.includes(id)) {
    state.rewards.stickers.push(id);
    state.rewards.logs.unshift({ id: `sticker-${id}-${Date.now()}`, type: "sticker", title: "스티커 획득", dateYmd: new Date().toISOString().slice(0,10), stickerId: id });
    writeState(state);
  }
  return state.rewards;
}

export function addBadge(id: string) {
  const state = readState();
  if (!state.rewards.badges.includes(id)) {
    state.rewards.badges.push(id);
    writeState(state);
  }
  return state.rewards;
}

export function buySkin(id: string, price: number) {
  const state = readState();
  if (state.rewards.coins < price) return { ok: false, rewards: state.rewards };
  if (!state.rewards.skins.includes(id)) {
    state.rewards.skins.push(id);
  }
  state.rewards.coins -= price;
  state.rewards.logs.unshift({ id: `skin-${id}-${Date.now()}`, type: "skin", title: "스킨 구매", dateYmd: new Date().toISOString().slice(0,10), skinId: id, coins: -price });
  if (!state.rewards.activeSkin) state.rewards.activeSkin = id;
  writeState(state);
  return { ok: true, rewards: state.rewards };
}

export function setActiveSkin(id: string) {
  const state = readState();
  if (!state.rewards.skins.includes(id)) return state.rewards;
  state.rewards.activeSkin = id;
  writeState(state);
  return state.rewards;
}

export function addDailyLog(dateYmd: string, coins: number, stickerId?: string) {
  const state = readState();
  state.rewards.logs.unshift({
    id: `daily-${dateYmd}-${Date.now()}`,
    type: "daily",
    title: "오늘의 미션 보상",
    dateYmd,
    coins,
    stickerId
  });
  state.rewards.logs = state.rewards.logs.slice(0, 30);
  writeState(state);
  return state.rewards;
}

export function updateQuestsOnDaily(dateYmd: string, correct: number, total: number) {
  const state = readState();
  const d = new Date(dateYmd);
  const w = weekIdFor(d);
  const s = seasonIdFor(d);

  if (state.quests.daily.dateYmd !== dateYmd) {
    state.quests.daily = { dateYmd, completed: true, perfect: correct === total };
  } else {
    state.quests.daily.completed = true;
    if (correct === total) state.quests.daily.perfect = true;
  }

  if (state.quests.weekly.weekId !== w) {
    state.quests.weekly = { weekId: w, sessions: 1 };
  } else {
    state.quests.weekly.sessions += 1;
  }

  if (state.quests.season.seasonId !== s) {
    state.quests.season = { seasonId: s, xp: 0 };
  }
  state.quests.season.xp += correct;

  writeState(state);
  return state.quests;
}

export function pickRandomStickerId(owned: string[]) {
  const pool = STICKER_CATALOG.map(s => s.id).filter(id => !owned.includes(id));
  const list = pool.length ? pool : STICKER_CATALOG.map(s => s.id);
  const pick = list[Math.floor(Math.random() * list.length)];
  return pick;
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getDailyShop(dateYmd: string, count = 3) {
  const seed = hashSeed(`shop|${dateYmd}`);
  const items = [...STICKER_CATALOG];
  const picks: { id: string; price: number }[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const idx = s % items.length;
    const pick = items.splice(idx, 1)[0];
    const price = 8 + (s % 8);
    picks.push({ id: pick.id, price });
  }
  return picks;
}

export function buySticker(id: string, price: number) {
  const state = readState();
  if (state.rewards.coins < price) return { ok: false, rewards: state.rewards };
  if (!state.rewards.stickers.includes(id)) {
    state.rewards.stickers.push(id);
  }
  state.rewards.coins -= price;
  state.rewards.logs.unshift({ id: `sticker-${id}-${Date.now()}`, type: "sticker", title: "스티커 구매", dateYmd: new Date().toISOString().slice(0,10), stickerId: id, coins: -price });
  writeState(state);
  return { ok: true, rewards: state.rewards };
}
