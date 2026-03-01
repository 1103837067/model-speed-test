import { get, set } from "idb-keyval";
import type { TestReport } from "../types";

const DB_KEY = "tps-benchmark-reports";

let writeQueue: Promise<void> = Promise.resolve();

export async function loadReports(): Promise<TestReport[]> {
  try {
    const data = await get<TestReport[]>(DB_KEY);
    return data ?? [];
  } catch {
    return [];
  }
}

export function saveReport(report: TestReport): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    const list = await loadReports();
    list.push(report);
    await set(DB_KEY, list);
  });
  return writeQueue;
}

export function deleteReport(id: string): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    const list = await loadReports();
    await set(
      DB_KEY,
      list.filter((r) => r.id !== id),
    );
  });
  return writeQueue;
}

export function clearReports(): Promise<void> {
  writeQueue = writeQueue.then(() => set(DB_KEY, []));
  return writeQueue;
}
