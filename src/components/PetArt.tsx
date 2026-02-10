"use client";

import type { PetSpecies } from "@/lib/model";

export default function PetArt({stage, species="chick", size=150}:{stage:string; species?: PetSpecies; size?: number}){
  const speciesLabel = {
    chick: { hatch: "병아리", evo1: "닭", evo2: "금빛 닭" },
    cat: { hatch: "새끼 고양이", evo1: "고양이", evo2: "멋쟁이 고양이" },
    dog: { hatch: "강아지", evo1: "큰 강아지", evo2: "듬직한 개" },
    bear: { hatch: "아기곰", evo1: "곰", evo2: "큰곰" },
  } as const;
  const label = stage === "egg" ? "알" : stage === "hatch"
    ? speciesLabel[species].hatch
    : stage === "evo1"
      ? speciesLabel[species].evo1
      : speciesLabel[species].evo2;
  return (
    <div className={`petArt ${stage} species-${species}`} style={{width:size, height:size}} aria-label={label}>
      <div className="petFace">
        <div className="petEye left" />
        <div className="petEye right" />
        <div className="petMouth" />
      </div>
      <div className="petLabel">{label}</div>
    </div>
  );
}
