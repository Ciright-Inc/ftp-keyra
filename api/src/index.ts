import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';
import { campaignRouter } from './routes/campaign.js';
import { adminRouter } from './routes/admin.js';
import { prisma } from './lib/prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:4200'],
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'keyra-ftp-api' });
});

app.use('/api/auth', authRouter);
app.use('/api', publicRouter);
app.use('/api/campaign', campaignRouter);
app.use('/api/admin', adminRouter);

const clientDist =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../public')
    : path.join(__dirname, '../../web/dist/web/browser');
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Frontend not built' });
  });
});

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[express]', err);
    const msg = err instanceof Error ? err.message : String(err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' ? { detail: msg } : {}),
      });
    }
  }
);

const server = app.listen(PORT, async () => {
  console.log(`KEYRA FTP API listening on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log('Press Ctrl+C to stop');
  try {
    await prisma.$connect();
    console.log('PostgreSQL: connected');
  } catch (e) {
    console.error(
      'PostgreSQL: NOT CONNECTED —',
      e instanceof Error ? e.message : e
    );
    console.error('Check DATABASE_URL in api/.env (login/admin need the database).');
  }
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${PORT} is already in use. Stop the other process first:\n` +
        `  Windows: netstat -ano | findstr :${PORT}\n` +
        `           taskkill /PID <PID> /F\n` +
        `  Or use another port: PORT=3001 npm run dev\n`
    );
  } else {
    console.error('Server failed to start:', err.message);
  }
  process.exit(1);
});

// Keep process alive in Git Bash / Windows terminals
process.stdin.resume();

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => process.exit(0));
});
