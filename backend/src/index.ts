import cors from 'cors';
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT ?? 4000;

const sessionSchema = z.object({
  durationMs: z.number().int().min(1000).max(10 * 60 * 1000),
  bananasEarned: z.number().int().min(0)
});

type SessionRecord = z.infer<typeof sessionSchema> & {
  id: string;
  createdAt: number;
};

const sessions: SessionRecord[] = [];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/sessions', (req, res) => {
  const parseResult = sessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid session payload', details: parseResult.error.flatten() });
  }

  const newSession: SessionRecord = {
    id: `sess_${Date.now()}`,
    createdAt: Date.now(),
    ...parseResult.data
  };

  sessions.push(newSession);

  res.status(201).json(newSession);
});

app.get('/sessions', (_req, res) => {
  res.json({ sessions });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`HUMM backend listening on port ${port}`);
});
