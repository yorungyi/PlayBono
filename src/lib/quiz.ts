export type Grade = 1 | 2 | 3 | 4;
export type Op = "add" | "sub" | "mul" | "div";
export type Difficulty = "easy" | "mid" | "hard";

export type Question = {
  id: string;
  op: Op;
  a: number;
  b: number;
  text: string;
  answer: number;
};

function xorshift32(seed: number) {
  let x = seed | 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

export function ymd(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function hashSeed(input: string) {
  // deterministic 32-bit hash
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rangeForAddSub(grade: Grade, diff: Difficulty) {
  // 초4(상) 기준: 3~4자리 덧뺄 (2자리×1자리 곱셈은 2차로)
  const caps: Record<Grade, [number, number, number]> = {
    1: [20, 30, 50],
    2: [99, 199, 499],
    3: [999, 1999, 4999],
    4: [9999, 9999, 9999],
  };
  const idx = diff === "easy" ? 0 : diff === "mid" ? 1 : 2;
  return caps[grade][idx];
}

function shouldBorrowOrCarry(grade: Grade, diff: Difficulty) {
  // 확률: 학년/난이도 높을수록 carry/borrow 유도
  const base = grade === 1 ? 0.25 : grade === 2 ? 0.45 : grade === 3 ? 0.6 : 0.65;
  const bump = diff === "easy" ? -0.1 : diff === "mid" ? 0 : 0.1;
  return Math.min(0.85, Math.max(0.15, base + bump));
}

function pick<T>(rng: () => number, items: T[]) {
  return items[Math.floor(rng() * items.length)];
}

export function dailyOpMix(grade: Grade): Op[] {
  // 10문제 분배 (기본)
  if (grade === 1) return ["add","add","add","add","add","add","sub","sub","sub","sub"];
  if (grade === 2) return ["add","add","add","add","add","sub","sub","sub","mul","mul"];
  if (grade === 3) return ["add","add","add","sub","sub","sub","mul","mul","mul","div"];
  return ["add","add","sub","sub","mul","mul","mul","div","div","div"];
}

function genAdd(rng: () => number, max: number, forceCarryP: number): [number, number] {
  let a = 0, b = 0;
  for (let tries = 0; tries < 30; tries++) {
    a = Math.floor(rng() * (max + 1));
    b = Math.floor(rng() * (max + 1));
    if (a + b > max) continue;
    if (rng() < forceCarryP) {
      // try to create carry by aligning last digit
      const ad = a % 10;
      const bd = b % 10;
      if (ad + bd < 10) {
        const needed = 10 - ad + Math.floor(rng() * 5);
        b = Math.min(max - a, b + needed);
      }
    }
    return [a, b];
  }
  return [a, b];
}

function genSub(rng: () => number, max: number, forceBorrowP: number): [number, number] {
  let a = 0, b = 0;
  for (let tries = 0; tries < 30; tries++) {
    a = Math.floor(rng() * (max + 1));
    b = Math.floor(rng() * (max + 1));
    if (a < b) [a, b] = [b, a];
    if (rng() < forceBorrowP) {
      const ad = a % 10;
      const bd = b % 10;
      if (ad >= bd) {
        // adjust b to require borrow
        const delta = (ad - bd) + 1 + Math.floor(rng() * 4);
        b = Math.min(a, b + delta);
      }
    }
    return [a, b];
  }
  if (a < b) [a, b] = [b, a];
  return [a, b];
}

function genMul(rng: () => number, grade: Grade): [number, number] {
  if (grade <= 2) {
    const a = pick(rng, [2,3,5]);
    const b = 1 + Math.floor(rng() * 9);
    return [a, b];
  }
  const a = 2 + Math.floor(rng() * 8); // 2..9
  const b = 1 + Math.floor(rng() * 9); // 1..9
  return [a, b];
}

function genDiv(rng: () => number, grade: Grade): [number, number] {
  // 나머지 없는 정수 나눗셈: a / b
  const b = grade <= 3 ? (2 + Math.floor(rng() * 7)) : (2 + Math.floor(rng() * 8)); // 2..8/9
  const q = 1 + Math.floor(rng() * 9); // 1..9
  const a = b * q;
  return [a, b];
}

export function generateDailyQuestions(opts: {
  uid: string;
  dateYmd: string;
  grade: Grade;
  difficulty: Difficulty;
  opsEnabled: Record<Op, boolean>;
  version?: string;
}): Question[] {
  const version = opts.version ?? "v1";
  const seed = hashSeed(`${opts.uid}|${opts.dateYmd}|${opts.grade}|${opts.difficulty}|${version}`);
  const r = xorshift32(seed);

  const mix = dailyOpMix(opts.grade).filter(op => opts.opsEnabled[op] !== false);
  const maxAddSub = rangeForAddSub(opts.grade, opts.difficulty);
  const carryP = shouldBorrowOrCarry(opts.grade, opts.difficulty);

  const qs: Question[] = [];
  for (let i = 0; i < 10; i++) {
    const op = mix[i % mix.length] as Op;
    let a=0,b=0,ans=0,text="";
    if (op === "add") { [a,b] = genAdd(r, maxAddSub, carryP); ans=a+b; text = `${a} + ${b} = ?`; }
    if (op === "sub") { [a,b] = genSub(r, maxAddSub, carryP); ans=a-b; text = `${a} - ${b} = ?`; }
    if (op === "mul") { [a,b] = genMul(r, opts.grade); ans=a*b; text = `${a} × ${b} = ?`; }
    if (op === "div") { [a,b] = genDiv(r, opts.grade); ans=Math.floor(a/b); text = `${a} ÷ ${b} = ?`; }
    qs.push({ id: `${opts.dateYmd}-${i}-${op}`, op, a, b, text, answer: ans });
  }
  return qs;
}
