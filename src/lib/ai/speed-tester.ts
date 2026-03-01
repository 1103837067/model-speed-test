import { streamText } from "ai";
import { v4 as uuidv4 } from "uuid";
import { createProviderModel } from "./provider-factory";
import type { ProviderConfig, TestResult, ModelTestState } from "../types";

export interface TestOptions {
  provider: ProviderConfig;
  modelId: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  onProgress: (state: ModelTestState) => void;
  abortSignal?: AbortSignal;
}

function buildResult(
  provider: ProviderConfig,
  modelId: string,
  startTime: number,
  endTime: number,
  outputChars: number,
  firstChunkTime: number,
  errorMessage?: string,
): TestResult {
  if (errorMessage || outputChars === 0) {
    return {
      id: uuidv4(),
      providerId: provider.id,
      providerName: provider.name,
      modelId,
      timestamp: Date.now(),
      status: "error",
      ttft_ms: 0,
      totalTime_ms: Math.round(endTime - startTime),
      outputChars: 0,
      cps: 0,
      errorMessage: errorMessage || "模型未返回任何内容",
    };
  }

  const ttft_ms = firstChunkTime > 0 ? firstChunkTime - startTime : 0;
  const totalTime_ms = endTime - startTime;
  const generationTime = totalTime_ms - ttft_ms;
  const cps = generationTime > 0 ? (outputChars / generationTime) * 1000 : 0;

  return {
    id: uuidv4(),
    providerId: provider.id,
    providerName: provider.name,
    modelId,
    timestamp: Date.now(),
    status: "success",
    ttft_ms: Math.round(ttft_ms),
    totalTime_ms: Math.round(totalTime_ms),
    outputChars,
    cps: Math.round(cps * 10) / 10,
  };
}

function extractErrorMessage(e: unknown): string {
  if (e instanceof DOMException && e.name === "AbortError") {
    return "测试已被手动终止";
  }
  if (e instanceof Error) return e.message;
  return String(e);
}

const PROGRESS_THROTTLE_MS = 100;

export async function runSpeedTest(options: TestOptions): Promise<TestResult> {
  const { provider, modelId, messages, onProgress, abortSignal } = options;

  const state: ModelTestState = {
    providerId: provider.id,
    providerName: provider.name,
    modelId,
    status: "running",
    streamedText: "",
    liveChars: 0,
    liveCps: 0,
    liveElapsed: 0,
    liveTtft: 0,
  };

  onProgress({ ...state });

  const startTime = performance.now();
  let firstChunkTime = 0;
  let outputChars = 0;
  let lastProgressTime = 0;

  try {
    if (abortSignal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const model = createProviderModel(provider, modelId);

    const result = streamText({
      model,
      messages,
      abortSignal,
    });

    for await (const chunk of result.textStream) {
      if (abortSignal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const now = performance.now();
      const isFirst = outputChars === 0;
      if (isFirst) {
        firstChunkTime = now;
        state.liveTtft = Math.round(now - startTime);
      }
      outputChars += chunk.length;
      state.streamedText += chunk;
      state.liveChars = outputChars;

      const elapsed = now - firstChunkTime;
      state.liveElapsed = Math.round(elapsed);
      state.liveCps =
        elapsed > 0 ? Math.round((outputChars / elapsed) * 1000 * 10) / 10 : 0;

      if (isFirst || now - lastProgressTime >= PROGRESS_THROTTLE_MS) {
        lastProgressTime = now;
        onProgress({ ...state });
      }
    }

    onProgress({ ...state });

    const endTime = performance.now();
    const testResult = buildResult(
      provider, modelId, startTime, endTime, outputChars, firstChunkTime,
    );

    state.status = "done";
    state.result = testResult;
    onProgress({ ...state });
    return testResult;
  } catch (e) {
    const endTime = performance.now();
    const testResult = buildResult(
      provider, modelId, startTime, endTime, 0, 0,
      extractErrorMessage(e),
    );

    state.status = "done";
    state.result = testResult;
    onProgress({ ...state });
    return testResult;
  }
}
