/**
 * Fireworks AI Adapter
 *
 * Fireworks uses an OpenAI-compatible API — this is a thin factory
 * that creates an OpenAIAdapter with the Fireworks endpoint baked in.
 * No separate class needed.
 */

import { createOpenAIAdapter } from "./openai";
import type { OpenAIAdapterConfig } from "./openai";

const FIREWORKS_BASE_URL = "https://api.fireworks.ai/inference/v1";

export interface FireworksAdapterConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export function createFireworksAdapter(config: FireworksAdapterConfig) {
  return createOpenAIAdapter({
    apiKey: config.apiKey,
    model: config.model || "accounts/fireworks/models/llama-v3p1-70b-instruct",
    baseUrl: config.baseUrl || FIREWORKS_BASE_URL,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  } satisfies OpenAIAdapterConfig);
}
