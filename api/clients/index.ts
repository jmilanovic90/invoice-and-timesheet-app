import {
  createClientHandler,
  listClientsHandler
} from '../../src/server/handlers/clients.handlers';

interface RequestLike {
  method?: string;
  body?: unknown;
}

interface ResponseLike {
  setHeader?(name: string, value: string | string[]): void;
  status(code: number): ResponseLike;
  json(payload: unknown): void;
  send(payload?: unknown): void;
}

export default async function handler(req: RequestLike, res: ResponseLike): Promise<void> {
  if (req.method === 'GET') {
    await listClientsHandler(res);
    return;
  }

  if (req.method === 'POST') {
    await createClientHandler(req.body, res);
    return;
  }

  res.setHeader?.('Allow', ['GET', 'POST']);
  res.status(405).json({ error: 'Method not allowed.' });
}
