import PracticeClient from "./PracticeClient";

export function generateStaticParams() {
  const grades = ["1","2","3","4"];
  const ops = ["add","sub","mul","div"];
  const out: {grade:string; op:string}[] = [];
  for (const grade of grades) for (const op of ops) out.push({ grade, op });
  return out;
}

export default function Page({ params }:{ params:{ grade:string; op:string } }) {
  return <PracticeClient params={params} />;
}
