import { defaultUserDoc, UserDoc } from "@/lib/model";
import type { Op } from "@/lib/quiz";

export type DailyDoc = {
  seed: number;
  dateYmd: string;
  questions: { id:string; op:Op; a:number; b:number; text:string; answer:number }[];
  answers?: { id:string; userAnswer:number; correct:boolean }[];
  score?: { correct:number; total:number; durationSec:number };
};

type LocalState = {
  uid: string;
  user: UserDoc;
  daily: Record<string, DailyDoc>;
};

const LS_KEY = "playbono:v1";

function readState(): LocalState {
  if (typeof window === "undefined") {
    return { uid: "local", user: defaultUserDoc, daily: {} };
  }
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    const fresh: LocalState = { uid: makeUid(), user: defaultUserDoc, daily: {} };
    localStorage.setItem(LS_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw) as LocalState;
    if (!parsed.uid) parsed.uid = makeUid();
    if (!parsed.user) parsed.user = defaultUserDoc;
    if (!parsed.daily) parsed.daily = {};
    return parsed;
  } catch {
    const fresh: LocalState = { uid: makeUid(), user: defaultUserDoc, daily: {} };
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
