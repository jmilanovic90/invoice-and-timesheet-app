export function formatDate(value: string): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-GB').format(new Date(value));
}
