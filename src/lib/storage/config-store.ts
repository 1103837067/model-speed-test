import type { ProviderConfig } from "../types";

const STORAGE_KEY = "tps-benchmark-providers";

export function loadProviders(): ProviderConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProviderConfig[]) : [];
  } catch {
    return [];
  }
}

export function saveProviders(providers: ProviderConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
}

export function addProvider(provider: ProviderConfig): ProviderConfig[] {
  const list = loadProviders();
  list.push(provider);
  saveProviders(list);
  return list;
}

export function updateProvider(provider: ProviderConfig): ProviderConfig[] {
  const list = loadProviders().map((p) =>
    p.id === provider.id ? provider : p,
  );
  saveProviders(list);
  return list;
}

export function removeProvider(id: string): ProviderConfig[] {
  const list = loadProviders().filter((p) => p.id !== id);
  saveProviders(list);
  return list;
}
