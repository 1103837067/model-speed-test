export type ProviderType = "openai-compatible" | "anthropic" | "google";

export interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  baseURL: string;
  apiKey: string;
  models: string[];
}

export type TestStatus = "success" | "error";

export interface TestResult {
  id: string;
  providerId: string;
  providerName: string;
  modelId: string;
  timestamp: number;
  status: TestStatus;
  /** Time to first token (ms) */
  ttft_ms: number;
  /** Total generation time (ms) */
  totalTime_ms: number;
  /** Approximate output character count */
  outputChars: number;
  /** Characters per second */
  cps: number;
  errorMessage?: string;
}

export interface NetworkEnv {
  ip: string;
  /** City / region, e.g. "Shanghai" */
  location: string;
  /** ISP name, e.g. "China Telecom" */
  isp: string;
  /** navigator.connection.effectiveType, e.g. "4g" */
  effectiveType: string;
  /** Estimated downlink Mbps */
  downlinkMbps: number;
  /** Estimated round-trip time ms */
  rttMs: number;
  /** navigator.userAgent */
  userAgent: string;
}

export interface TestReport {
  id: string;
  name: string;
  createdAt: number;
  prompt: string;
  mode: "concurrent" | "sequential";
  results: TestResult[];
  successCount: number;
  errorCount: number;
  env?: NetworkEnv;
}

export type RunningStatus = "idle" | "queued" | "running" | "done" | "skipped";

export interface ModelTestState {
  providerId: string;
  providerName: string;
  modelId: string;
  status: RunningStatus;
  result?: TestResult;
  streamedText: string;
  /** Real-time chars received so far */
  liveChars: number;
  /** Real-time chars per second (updated during streaming) */
  liveCps: number;
  /** Real-time elapsed ms since generation started (after TTFT) */
  liveElapsed: number;
  /** Real-time TTFT in ms (set once first chunk arrives) */
  liveTtft: number;
}
