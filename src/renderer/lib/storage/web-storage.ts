export class WebStorage {
  read<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') {
      return fallback;
    }

    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      this.write(key, fallback);
      return fallback;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      this.write(key, fallback);
      return fallback;
    }
  }

  write<T>(key: string, value: T): T {
    window.localStorage.setItem(key, JSON.stringify(value));
    return value;
  }
  remove(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(key);
  }
}
