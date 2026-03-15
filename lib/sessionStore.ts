export type SessionRecord = {
  id: string;
  durationMs: number;
  bananasEarned: number;
  createdAt: string;
};

const store: SessionRecord[] = [];

export function listSessions(): SessionRecord[] {
  return store;
}

export function addSession(session: Omit<SessionRecord, "id" | "createdAt">): SessionRecord {
  const next: SessionRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...session
  };

  store.unshift(next);
  return next;
}
