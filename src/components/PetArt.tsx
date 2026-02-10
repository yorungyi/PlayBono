"use client";

export default function PetArt({stage, size=150}:{stage:string; size?: number}){
  const label = stage === "egg" ? "알" : stage === "hatch" ? "병아리" : stage === "evo1" ? "토끼" : "여우";
  return (
    <div className={`petArt ${stage}`} style={{width:size, height:size}} aria-label={label}>
      <div className="petFace">
        <div className="petEye left" />
        <div className="petEye right" />
        <div className="petMouth" />
      </div>
      <div className="petLabel">{label}</div>
    </div>
  );
}
