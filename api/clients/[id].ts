import {
  deleteClientHandler,
  updateClientHandler
} from '../../src/server/handlers/clients.handlers';

interface RequestLike {
  method?: string;
  body?: unknown;
  query?: { id?: string | string[] };
}

interface ResponseLike {
  setHeader?(name: string, value: string | string[]): void;
  status(code: number): ResponseLike;
  json(payload: unknown): void;
  send(payload?: unknown): void;
}

function getId(req: RequestLike): string {
  const value = req.query?.id;
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function handler(req: RequestLike, res: ResponseLike): Promise<void> {
  const id = getId(req);

  if (req.method === 'PUT') {
    await updateClientHandler(id, req.body, res);
    return;
  }

  if (req.method === 'DELETE') {
    await deleteClientHandler(id, res);
    return;
  }

  res.setHeader?.('Allow', ['PUT', 'DELETE']);
  res.status(405).json({ error: 'Method not allowed.' });
}
