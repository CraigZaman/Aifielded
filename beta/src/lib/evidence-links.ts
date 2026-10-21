export function evidenceHref(missionId: string, evidenceId: string) {
  return `/app/missions/${encodeURIComponent(missionId)}/evidence/${encodeURIComponent(evidenceId)}`;
}

export function evidencePage(value: string | undefined) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 && page <= 100000 ? page : 1;
}

// Historical synthesis records store references as one "[observation UUID] summary" per line.
export function parseEvidenceReference(value: string) {
  const match = /^\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]\s+([\s\S]+)$/i.exec(value.trim());
  return match ? { id: match[1], summary: match[2] } : null;
}
