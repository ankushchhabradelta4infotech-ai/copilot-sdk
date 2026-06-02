/**
 * Fireworks AI Provider
 *
 * Fireworks.ai is a high-performance inference platform for open-source models
 * (Llama, DeepSeek, Qwen, Mixtral, Kimi, GLM, MiniMax, and more).
 *
 * Uses an OpenAI-compatible API — set FIREWORKS_API_KEY in your environment.
 *
 * @see https://fireworks.ai/docs
 */

// NEW: Modern pattern — fireworks() function (legacy export preserved)
export { fireworks, createFireworks as createFireworksModel } from "./provider";
export type { FireworksProviderOptions } from "./provider";

import { createFireworksAdapter } from "../../adapters/fireworks";
import {
  createCallableProvider,
  type AIProvider,
  type ProviderCapabilities,
  type FireworksProviderConfig,
} from "../types";

// ============================================
// Model Definitions
// ============================================

interface ModelCapabilities {
  vision: boolean;
  tools: boolean;
  maxTokens: number;
}

// Common Fireworks-hosted models. The provider also supports arbitrary
// `accounts/fireworks/models/*` IDs — anything not in this table falls
// back to safe defaults from `defaultCapabilities`.
const FIREWORKS_MODELS: Record<string, ModelCapabilities> = {
  // Llama 3.1 family
  "accounts/fireworks/models/llama-v3p1-405b-instruct": {
    vision: false,
    tools: true,
    maxTokens: 131072,
  },
  "accounts/fireworks/models/llama-v3p1-70b-instruct": {
    vision: false,
    tools: true,
    maxTokens: 131072,
  },
  "accounts/fireworks/models/llama-v3p1-8b-instruct": {
    vision: false,
    tools: true,
    maxTokens: 131072,
  },

  // DeepSeek family
  "accounts/fireworks/models/deepseek-v3": {
    vision: false,
    tools: true,
    maxTokens: 128000,
  },
  "accounts/fireworks/models/deepseek-v3p1": {
    vision: false,
    tools: true,
    maxTokens: 128000,
  },
  "accounts/fireworks/models/deepseek-r1": {
    vision: false,
    tools: true,
    maxTokens: 128000,
  },

  // Kimi family (Moonshot AI)
  "accounts/fireworks/models/kimi-k2-instruct": {
    vision: false,
    tools: true,
    maxTokens: 131072,
  },
  "accounts/fireworks/models/kimi-k2p5": {
    vision: false,
    tools: true,
    maxTokens: 131072,
  },
  "accounts/fireworks/models/kimi-k2p6": {
    vision: false,
    tools: true,
    maxTokens: 131072,
  },

  // GLM family (Zhipu)
  "accounts/fireworks/models/glm-4p5": {
    vision: false,
    tools: true,
    maxTokens: 128000,
  },
  "accounts/fireworks/models/glm-5p1": {
    vision: false,
    tools: true,
    maxTokens: 128000,
  },

  // MiniMax family
  "accounts/fireworks/models/minimax-m2": {
    vision: false,
    tools: true,
    maxTokens: 128000,
  },
  "accounts/fireworks/models/minimax-m2p1": {
    vision: false,
    tools: true,
    maxTokens: 128000,
  },
  "accounts/fireworks/models/minimax-m2p7": {
    vision: false,
    tools: true,
    maxTokens: 128000,
  },
};

const defaultCapabilities: ModelCapabilities = {
  vision: false,
  tools: true,
  maxTokens: 131072,
};

// ============================================
// Provider Implementation
// ============================================

/**
 * Create a Fireworks AI provider (callable, Vercel AI SDK style)
 *
 * @example
 * ```typescript
 * const fireworks = createFireworks({ apiKey: '...' });
 *
 * // Callable - Vercel AI SDK style
 * const model = fireworks('accounts/fireworks/models/kimi-k2p6');
 *
 * // Also supports method call (backward compatible)
 * const model2 = fireworks.languageModel('accounts/fireworks/models/glm-5p1');
 *
 * // Check capabilities
 * const caps = fireworks.getCapabilities('accounts/fireworks/models/kimi-k2p6');
 * ```
 */
export function createFireworks(
  config: FireworksProviderConfig = {},
): AIProvider {
  const apiKey = config.apiKey ?? process.env.FIREWORKS_API_KEY ?? "";

  // Create the callable function
  const providerFn = (modelId: string) => {
    return createFireworksAdapter({
      apiKey,
      model: modelId,
      baseUrl: config.baseUrl,
    });
  };

  // Get capabilities helper
  const getCapabilities = (modelId: string): ProviderCapabilities => {
    const model = FIREWORKS_MODELS[modelId] ?? defaultCapabilities;

    return {
      supportsVision: model.vision,
      supportsTools: model.tools,
      supportsThinking: false,
      supportsStreaming: true,
      supportsPDF: false,
      supportsAudio: false,
      supportsVideo: false,
      maxTokens: model.maxTokens,
      supportedImageTypes: model.vision
        ? ["image/png", "image/jpeg", "image/gif", "image/webp"]
        : [],
      // Fireworks accepts OpenAI-compatible `response_format` on most models.
      supportsJsonMode: true,
      supportsSystemMessages: true,
    };
  };

  return createCallableProvider(providerFn, {
    name: "fireworks",
    supportedModels: Object.keys(FIREWORKS_MODELS),
    getCapabilities,
  });
}

// Alias for consistency with other providers
export const createFireworksProvider = createFireworks;
