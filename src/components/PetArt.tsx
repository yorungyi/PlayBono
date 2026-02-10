"use client";

import type { PetSpecies } from "@/lib/model";

export default function PetArt({stage, species="chick", size=150}:{stage:string; species?: PetSpecies; size?: number}){
  const label = stage === "egg" ? "알" : stage === "hatch" ? "병아리" : stage === "evo1" ? "토끼" : "여우";
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
