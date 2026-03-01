import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  ProviderConfig,
  ModelTestState,
  TestResult,
  TestReport,
  NetworkEnv,
} from "@/lib/types";
import { runSpeedTest } from "@/lib/ai/speed-tester";
import { saveReport } from "@/lib/storage/report-store";
import { collectEnv } from "@/lib/env-collector";

export type TestMode = "concurrent" | "sequential";

interface SelectedModel {
  provider: ProviderConfig;
  modelId: string;
}

function makeKey(providerId: string, modelId: string) {
  return `${providerId}::${modelId}`;
}

function makeInitState(
  provider: ProviderConfig,
  modelId: string,
  status: "idle" | "queued",
): ModelTestState {
  return {
    providerId: provider.id,
    providerName: provider.name,
    modelId,
    status,
    streamedText: "",
    liveChars: 0,
    liveCps: 0,
    liveElapsed: 0,
    liveTtft: 0,
  };
}

export function useTestRunner() {
  const [testStates, setTestStates] = useState<Map<string, ModelTestState>>(
    new Map(),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [lastReportId, setLastReportId] = useState<string | null>(null);
  const [currentTestKey, setCurrentTestKey] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const skipControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<TestResult[]>([]);
  const statesRef = useRef<Map<string, ModelTestState>>(new Map());
  const rafRef = useRef<number>(0);
  const dirtyRef = useRef(false);

  const flushStates = useCallback(() => {
    if (dirtyRef.current) {
      dirtyRef.current = false;
      setTestStates(new Map(statesRef.current));
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (!dirtyRef.current) {
      dirtyRef.current = true;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(flushStates);
    }
  }, [flushStates]);

  const makeProgressHandler = (key: string) => (state: ModelTestState) => {
    statesRef.current.set(key, state);
    scheduleFlush();
  };

  const collectResult = (result: TestResult) => {
    resultsRef.current = [...resultsRef.current, result];
    setResults([...resultsRef.current]);
  };

  const runTests = useCallback(
    async (
      selectedModels: SelectedModel[],
      messages: Array<{
        role: "user" | "assistant" | "system";
        content: string;
      }>,
      mode: TestMode = "concurrent",
    ) => {
      cancelAnimationFrame(rafRef.current);
      dirtyRef.current = false;

      const ac = new AbortController();
      abortControllerRef.current = ac;
      resultsRef.current = [];
      statesRef.current = new Map();
      setIsRunning(true);
      setResults([]);
      setLastReportId(null);
      setCurrentTestKey(null);

      const prompt = messages.map((m) => m.content).join("\n");

      const envPromise = collectEnv();

      const initMap = new Map<string, ModelTestState>();
      for (const { provider, modelId } of selectedModels) {
        const key = makeKey(provider.id, modelId);
        initMap.set(
          key,
          makeInitState(provider, modelId, mode === "sequential" ? "queued" : "idle"),
        );
      }
      statesRef.current = new Map(initMap);
      setTestStates(new Map(initMap));

      if (mode === "concurrent") {
        const tasks = selectedModels.map(({ provider, modelId }) => {
          const key = makeKey(provider.id, modelId);
          return runSpeedTest({
            provider,
            modelId,
            messages,
            abortSignal: ac.signal,
            onProgress: makeProgressHandler(key),
          }).then((result) => {
            collectResult(result);
            return result;
          });
        });
        await Promise.allSettled(tasks);
      } else {
        for (let i = 0; i < selectedModels.length; i++) {
          const { provider, modelId } = selectedModels[i];
          const key = makeKey(provider.id, modelId);

          if (ac.signal.aborted) {
            const existing = statesRef.current.get(key);
            if (existing && (existing.status === "queued" || existing.status === "idle")) {
              statesRef.current.set(key, { ...existing, status: "skipped" });
            }
            continue;
          }

          setCurrentTestKey(key);

          const itemAc = new AbortController();
          skipControllerRef.current = itemAc;

          const onAbortAll = () => itemAc.abort();
          ac.signal.addEventListener("abort", onAbortAll, { once: true });

          const result = await runSpeedTest({
            provider,
            modelId,
            messages,
            abortSignal: itemAc.signal,
            onProgress: makeProgressHandler(key),
          });

          ac.signal.removeEventListener("abort", onAbortAll);
          skipControllerRef.current = null;
          collectResult(result);
        }

        for (const [key, s] of statesRef.current) {
          if (s.status === "queued" || s.status === "idle") {
            statesRef.current.set(key, { ...s, status: "skipped" });
          }
        }
      }

      cancelAnimationFrame(rafRef.current);
      setTestStates(new Map(statesRef.current));
      setCurrentTestKey(null);

      const finalResults = resultsRef.current;
      const reportId = uuidv4();
      const now = Date.now();
      const modelCount = finalResults.length;
      const successCount = finalResults.filter(
        (r) => r.status === "success",
      ).length;

      let env: NetworkEnv | undefined;
      try {
        env = await envPromise;
      } catch {
        /* non-critical */
      }

      const report: TestReport = {
        id: reportId,
        name: `测试 #${now} (${modelCount} 模型, ${successCount} 成功)`,
        createdAt: now,
        prompt,
        mode,
        results: finalResults,
        successCount,
        errorCount: modelCount - successCount,
        env,
      };

      await saveReport(report);
      setLastReportId(reportId);
      setIsRunning(false);
      abortControllerRef.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scheduleFlush],
  );

  const stopTests = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const skipCurrent = useCallback(() => {
    skipControllerRef.current?.abort();
  }, []);

  return {
    testStates,
    isRunning,
    results,
    lastReportId,
    currentTestKey,
    runTests,
    stopTests,
    skipCurrent,
  };
}
