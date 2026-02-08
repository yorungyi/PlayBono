"use client";

export default function PrintButton() {
  return (
    <button className="btn" onClick={() => window.print()}>
      프린트
    </button>
  );
}
