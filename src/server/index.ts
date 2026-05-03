import express from 'express';
import { env } from './config/env';
import { companyRouter } from './routes/company.routes';
import { clientsRouter } from './routes/clients.routes';
import { invoicesRouter } from './routes/invoices.routes';
import { timesheetsRouter } from './routes/timesheets.routes';

const app = express();

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/company', companyRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/timesheets', timesheetsRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`);
});
