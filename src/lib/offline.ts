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
};

export const STICKER_CATALOG: { id: string; name: string; color: string }[] = [
  { id: "star", name: "반짝별", color: "#ffd166" },
  { id: "cloud", name: "구름", color: "#a5f3fc" },
  { id: "leaf", name: "잎새", color: "#86efac" },
  { id: "rocket", name: "로켓", color: "#fca5a5" },
  { id: "planet", name: "행성", color: "#c4b5fd" },
  { id: "balloon", name: "풍선", color: "#fcd34d" },
  { id: "fish", name: "물고기", color: "#93c5fd" },
  { id: "puzzle", name: "퍼즐", color: "#f9a8d4" },
  { id: "crown", name: "왕관", color: "#fbbf24" },
  { id: "dice", name: "주사위", color: "#fdba74" },
  { id: "gem", name: "보석", color: "#a7f3d0" },
  { id: "music", name: "음표", color: "#fda4af" },
];

type LocalState = {
  uid: string;
  user: UserDoc;
  daily: Record<string, DailyDoc>;
  rewards: RewardState;
};

const LS_KEY = "playbono:v1";
const defaultRewards: RewardState = { coins: 0, stickers: [], lastDailyRewardYmd: "" };

function readState(): LocalState {
  if (typeof window === "undefined") {
    return { uid: "local", user: defaultUserDoc, daily: {}, rewards: defaultRewards };
  }
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    const fresh: LocalState = { uid: makeUid(), user: defaultUserDoc, daily: {}, rewards: defaultRewards };
    localStorage.setItem(LS_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw) as LocalState;
    if (!parsed.uid) parsed.uid = makeUid();
    if (!parsed.user) parsed.user = defaultUserDoc;
    if (!parsed.daily) parsed.daily = {};
    if (!parsed.rewards) parsed.rewards = defaultRewards;
    return parsed;
  } catch {
    const fresh: LocalState = { uid: makeUid(), user: defaultUserDoc, daily: {}, rewards: defaultRewards };
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
    writeState(state);
  }
  return state.rewards;
}

export function pickRandomStickerId(owned: string[]) {
  const pool = STICKER_CATALOG.map(s => s.id).filter(id => !owned.includes(id));
  const list = pool.length ? pool : STICKER_CATALOG.map(s => s.id);
  const pick = list[Math.floor(Math.random() * list.length)];
  return pick;
}
