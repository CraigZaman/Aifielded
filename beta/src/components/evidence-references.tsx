import Link from "next/link";
import { evidenceHref, parseEvidenceReference } from "@/lib/evidence-links";

export function EvidenceReferences({ missionId, references }: { missionId: string; references: string[] }) {
  if (!references.length) return null;
  return <ul className="evidence-references">{references.map((value, index) => {
    const reference = parseEvidenceReference(value);
    return <li key={index}>{reference ? <Link href={evidenceHref(missionId, reference.id)}>{reference.summary}</Link> : <span>{value}</span>}</li>;
  })}</ul>;
}
