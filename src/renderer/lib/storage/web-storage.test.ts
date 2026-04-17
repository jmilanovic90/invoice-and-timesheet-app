import assert from 'node:assert/strict';
import { WebStorage } from './web-storage';

type LocalStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

function createLocalStorageMock(seed: Record<string, string> = {}): LocalStorageLike {
  const store = new Map(Object.entries(seed));

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  };
}

export function runWebStorageTests(): void {
  const globalScope = globalThis as { window?: Window };
  const originalWindow = globalScope.window;
  const localStorage = createLocalStorageMock();
  globalScope.window = { localStorage: localStorage as unknown as Storage } as Window;

  try {
    const storage = new WebStorage();

    assert.deepEqual(storage.read('missing', { empty: true }), { empty: true });
    assert.equal(localStorage.getItem('missing'), JSON.stringify({ empty: true }));

    localStorage.setItem('broken', '{bad-json');
    assert.deepEqual(storage.read('broken', ['safe']), ['safe']);
    assert.equal(localStorage.getItem('broken'), JSON.stringify(['safe']));

    storage.write('numbers', [1, 2, 3]);
    assert.equal(localStorage.getItem('numbers'), JSON.stringify([1, 2, 3]));

    storage.remove('numbers');
    assert.equal(localStorage.getItem('numbers'), null);
  } finally {
    if (originalWindow) {
      globalScope.window = originalWindow;
    } else {
      Reflect.deleteProperty(globalScope, 'window');
    }
  }
}
