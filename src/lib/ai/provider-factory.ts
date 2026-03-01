import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { ProviderConfig } from "../types";

export function createProviderModel(config: ProviderConfig, modelId: string) {
  switch (config.type) {
    case "openai-compatible": {
      const provider = createOpenAICompatible({
        name: config.name,
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      });
      return provider(modelId);
    }
    case "anthropic": {
      const provider = createAnthropic({
        apiKey: config.apiKey,
        baseURL: config.baseURL || undefined,
      });
      return provider(modelId);
    }
    case "google": {
      const provider = createGoogleGenerativeAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL || undefined,
      });
      return provider(modelId);
    }
    default:
      throw new Error(`Unsupported provider type: ${config.type}`);
  }
}
