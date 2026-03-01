import type { ProviderConfig } from "../types";

const ANTHROPIC_KNOWN_MODELS = [
  "claude-sonnet-4-20250514",
  "claude-3-7-sonnet-20250219",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-opus-20240229",
  "claude-3-haiku-20240307",
];

export interface FetchModelsResult {
  models: string[];
  error?: string;
}

export async function fetchModels(
  config: ProviderConfig,
): Promise<FetchModelsResult> {
  try {
    switch (config.type) {
      case "openai-compatible":
        return await fetchOpenAIModels(config);
      case "google":
        return await fetchGoogleModels(config);
      case "anthropic":
        return {
          models: ANTHROPIC_KNOWN_MODELS,
        };
      default:
        return { models: [], error: `Unknown provider type: ${config.type}` };
    }
  } catch (e) {
    return {
      models: [],
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function fetchOpenAIModels(
  config: ProviderConfig,
): Promise<FetchModelsResult> {
  const url = `${config.baseURL.replace(/\/$/, "")}/models`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const models: string[] = (json.data ?? []).map(
    (m: { id: string }) => m.id,
  );
  models.sort();
  return { models };
}

async function fetchGoogleModels(
  config: ProviderConfig,
): Promise<FetchModelsResult> {
  const baseURL = (config.baseURL || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
  const url = `${baseURL}/models?key=${config.apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const models: string[] = (json.models ?? [])
    .map((m: { name: string }) => m.name.replace("models/", ""))
    .filter((name: string) => name.startsWith("gemini"));
  models.sort();
  return { models };
}
