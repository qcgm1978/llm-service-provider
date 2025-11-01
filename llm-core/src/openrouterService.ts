const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
import { generatePrompt } from './llmService';
import { getItem, getEnv } from './utils';

// 定义可用模型
export const OPENROUTER_MODELS = {
  "openai/gpt-4o": "OpenAI GPT-4o",
  "qwen/qwen3-coder:free": "Qwen3 Coder (Free)",
  "openai/gpt-oss-20b:free": "OpenAI GPT-OSS-20B (Free)",
  "z-ai/glm-4.5-air:free": "GLM-4.5-Air (Free)",
};

// 获取默认模型
export const getDefaultModel = (): string =>
  localStorage.getItem("OPENROUTER_SELECTED_MODEL") || "qwen/qwen3-coder:free";

// 获取用户选择的模型
export function getSelectedModel(): string {
  if (typeof window !== "undefined" && window.localStorage) {
    const savedModel = localStorage.getItem("OPENROUTER_SELECTED_MODEL");
    if (savedModel && Object.keys(OPENROUTER_MODELS).includes(savedModel)) {
      return savedModel;
    }
  }
  return getDefaultModel();
}

// 设置用户选择的模型
export function setSelectedModel(model: string): void {
  localStorage.setItem("OPENROUTER_SELECTED_MODEL", model);
}

export function getAvailableModels(): Record<string, string> {
  return OPENROUTER_MODELS;
}

function getApiKey(): string | undefined {
  return getItem('OPENROUTER_API_KEY') || getEnv('OPENROUTER_API_KEY');
}

export function setApiKey(apiKey: string): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("OPENROUTER_API_KEY", apiKey);
  }
}

export function clearApiKey(): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.removeItem("OPENROUTER_API_KEY");
  }
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

// 修改streamDefinition函数使用选定的模型
export async function* streamDefinition(
  topic: string,
  language: "zh" | "en" = "zh",
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const apiKey = getApiKey();
  const model = getSelectedModel(); // 使用选定的模型
  let accumulatedContent = "";
  if (!apiKey) {
    const errorMsg =
      language === "zh"
        ? "Error: OPENROUTER_API_KEY is not configured. Please configure your API key in the settings to continue."
        : "Error: OPENROUTER_API_KEY is not configured. Please configure your API key in the settings to continue.";
    yield errorMsg;
    return;
  }

  const prompt = generatePrompt(topic, language, context);
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // 'HTTP-Referer': 'https://example.com', // 可配置的站点URL
        // 'X-Title': 'LLM Service Provider', // 可配置的站点标题
      },
      body: JSON.stringify({
        model: model, // 使用选定的模型
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              if (accumulatedContent) {
                yield accumulatedContent;
                accumulatedContent = "";
              }
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                accumulatedContent += parsed.choices[0].delta.content;
                if (accumulatedContent.length >= 40) {
                  yield accumulatedContent;
                  accumulatedContent = "";
                }
              }
            } catch (e) {}
          }
        }
      }
    } finally {
      if (accumulatedContent) {
        yield accumulatedContent;
      }
      reader.releaseLock();
    }
  } catch (error) {
    if (accumulatedContent) {
      yield accumulatedContent;
    }
    console.error("Error streaming from OpenRouter:", error);
    const msg =
      language === "zh"
        ? `请配置OPENROUTER_API_KEY`
        : `Please configure OPENROUTER_API_KEY`;
    const errorMessage = `Error: ${error instanceof Error ? error.message : "An unknown error occurred."}. ${msg}`;
    throw new Error(errorMessage);
  }
}
