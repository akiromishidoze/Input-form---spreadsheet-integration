import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getAll, getById, add, update, remove, clearAll } from './db';
import { validateEntry, sanitizeObject, sanitize } from './validation';
import { errorHandler, AppError } from './errorHandler';
import { loginHandler, authMiddleware } from './auth';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.post('/api/auth/login', loginHandler);

app.use('/api/entries', authMiddleware);

app.get('/api/entries', (_req: Request, res: Response) => {
  const entries = getAll().map(e => ({ ...e, data: JSON.parse(e.data) }));
  res.json(entries);
});

app.get('/api/entries/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const entry = getById(id);
  if (!entry) throw new AppError(404, 'Entry not found');
  res.json({ ...entry, data: JSON.parse(entry.data) });
});

app.post('/api/entries', (req: Request, res: Response) => {
  const errs = validateEntry(req.body);
  if (errs.length) throw new AppError(400, errs.map(e => e.message).join('; '));

  const form = sanitize(req.body.form) as string;
  const data = sanitizeObject((req.body.data ?? {}) as Record<string, unknown>);
  const submitted = (req.body.submitted as string) || new Date().toISOString();
  const id = Date.now() + '_' + Math.random().toString(36).slice(2, 6);

  add(id, form, data, submitted);
  res.status(201).json({ id, form, data, submitted });
});

app.put('/api/entries/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = getById(id);
  if (!existing) throw new AppError(404, 'Entry not found');

  const errs = validateEntry(req.body);
  if (errs.length) throw new AppError(400, errs.map(e => e.message).join('; '));

  const form = sanitize(req.body.form) as string;
  const data = sanitizeObject((req.body.data ?? {}) as Record<string, unknown>);
  const submitted = (req.body.submitted as string) || existing.submitted;

  update(id, form, data, submitted);
  res.json({ id, form, data, submitted });
});

app.delete('/api/entries/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const entry = getById(id);
  if (!entry) throw new AppError(404, 'Entry not found');
  remove(id);
  res.json({ ok: true });
});

app.delete('/api/entries', (_req: Request, res: Response) => {
  clearAll();
  res.json({ ok: true });
});

const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
