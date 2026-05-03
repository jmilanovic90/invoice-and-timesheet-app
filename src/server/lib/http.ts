import type { Response } from 'express';

export function sendSupabaseError(res: Response, error: unknown, fallbackMessage: string): void {
  console.error(error);
  res.status(500).json({ error: fallbackMessage });
}
