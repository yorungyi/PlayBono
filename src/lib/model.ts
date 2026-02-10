import { Timestamp } from "firebase/firestore";

export type Grade = 1|2|3|4;
export type Op = "add"|"sub"|"mul"|"div";
export type PetStage = "egg"|"hatch"|"evo1"|"evo2";

export type UserDoc = {
  grade: Grade;
  opsEnabled: Record<Op, boolean>;
  pet: {
    stage: PetStage;
    xp: number;
    evoPoints: number;
  };
  streak: {
    count: number;
    lastDailyDate: string; // YYYY-MM-DD
  };
  createdAt?: Timestamp;
  lastSeen?: Timestamp;
};

export const defaultUserDoc: UserDoc = {
  grade: 1,
  opsEnabled: { add:true, sub:true, mul:true, div:true },
  pet: { stage:"egg", xp:0, evoPoints:0 },
  streak: { count:0, lastDailyDate:"" }
};

export function stageLabel(stage: PetStage) {
  if (stage === "egg") return "알";
  if (stage === "hatch") return "병아리";
  if (stage === "evo1") return "토끼";
  return "여우";
}

export function nextStage(stage: PetStage): PetStage {
  if (stage === "egg") return "hatch";
  if (stage === "hatch") return "evo1";
  if (stage === "evo1") return "evo2";
  return "evo2";
}
