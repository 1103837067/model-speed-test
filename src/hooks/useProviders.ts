import { useState, useCallback } from "react";
import type { ProviderConfig } from "@/lib/types";
import {
  loadProviders,
  saveProviders,
  removeProvider as removeFromStore,
} from "@/lib/storage/config-store";

export function useProviders() {
  const [providers, setProviders] = useState<ProviderConfig[]>(loadProviders);

  const addProvider = useCallback((provider: ProviderConfig) => {
    setProviders((prev) => {
      const next = [...prev, provider];
      saveProviders(next);
      return next;
    });
  }, []);

  const updateProvider = useCallback((provider: ProviderConfig) => {
    setProviders((prev) => {
      const next = prev.map((p) => (p.id === provider.id ? provider : p));
      saveProviders(next);
      return next;
    });
  }, []);

  const removeProvider = useCallback((id: string) => {
    const next = removeFromStore(id);
    setProviders(next);
  }, []);

  const refreshProviders = useCallback(() => {
    setProviders(loadProviders());
  }, []);

  return {
    providers,
    addProvider,
    updateProvider,
    removeProvider,
    refreshProviders,
  };
}
