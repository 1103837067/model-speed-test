import { useState, useEffect, useCallback } from "react";
import type { TestReport } from "@/lib/types";
import {
  loadReports,
  deleteReport as deleteFromStore,
  clearReports as clearAllReports,
} from "@/lib/storage/report-store";

export function useReports() {
  const [reports, setReports] = useState<TestReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await loadReports();
    list.sort((a, b) => b.createdAt - a.createdAt);
    setReports(list);
    setLoading(false);
  }, []);

  const deleteReport = useCallback(
    async (id: string) => {
      await deleteFromStore(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [selectedId],
  );

  const clearReports = useCallback(async () => {
    await clearAllReports();
    setReports([]);
    setSelectedId(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectedReport = reports.find((r) => r.id === selectedId) ?? null;

  return {
    reports,
    selectedId,
    selectedReport,
    loading,
    setSelectedId,
    refresh,
    deleteReport,
    clearReports,
  };
}
