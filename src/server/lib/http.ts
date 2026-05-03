interface HttpResponseLike {
  status(code: number): HttpResponseLike;
  json(payload: unknown): void;
  setHeader?(name: string, value: string | string[]): void;
}

export function sendSupabaseError(res: HttpResponseLike, error: unknown, fallbackMessage: string): void {
  console.error(error);
  res.status(500).json({ error: fallbackMessage });
}
