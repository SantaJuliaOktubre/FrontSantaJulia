export function readStore<T>(key: string, fallback?: T): T {
    const raw = localStorage.getItem(key);
    try {
        if (raw) return JSON.parse(raw);
        return fallback as T;
    } catch {
        return fallback as T;
    }
}

export function writeStore<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
}

export function removeStore(key: string): void {
    localStorage.removeItem(key);
}


