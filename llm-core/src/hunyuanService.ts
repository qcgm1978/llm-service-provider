import { generatePrompt } from './llmService';
import { getItem, setItem, removeItem, getEnv } from './utils';

const HUNYUAN_API_URL = 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions';
const HUNYUAN_MODEL = 'hunyuan-turbos-latest';

// 腾讯混元模型列表
export const HUNYUAN_MODELS = {
  "hunyuan-pro": "混元大模型 Pro",
  "hunyuan-standard": "混元大模型 Standard",
  "hunyuan-lite": "混元大模型 Lite"
};

// 获取API密钥
function getApiKey(): string | undefined {
  return getItem('HUNYUAN_API_KEY') || getEnv('HUNYUAN_API_KEY') || undefined;
}

export function setApiKey(apiKey: string): void {
  if (apiKey) {
    setItem('HUNYUAN_API_KEY', apiKey);
  } else {
    removeItem('HUNYUAN_API_KEY');
  }
}

export function clearApiKey(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('HUNYUAN_API_KEY');
  }
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export async function* streamDefinition(
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const apiKey = getApiKey();
  let accumulatedContent = '';
  if (!apiKey) {
    const errorMsg =
      language === 'zh'
        ? 'Error: HUNYUAN_API_KEY is not configured. Please configure your API key in the settings to continue.'
        : 'Error: HUNYUAN_API_KEY is not configured. Please configure your API key in the settings to continue.';
    yield errorMsg;
    return;
  }

  const prompt = generatePrompt(topic, language, context);
  try {
    const response = await fetch(HUNYUAN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: HUNYUAN_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        enable_enhancement: true,
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              if (accumulatedContent) {
                yield accumulatedContent;
                accumulatedContent = '';
              }
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices.length > 0 && parsed.choices[0].delta) {
                const content = parsed.choices[0].delta.content || '';
                if (content) {
                  accumulatedContent += content;
                  yield content; // 只返回新增的内容，而不是累积的完整内容
                }
              }
            } catch (e) {
              // Ignore JSON parsing errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const prefix = language === 'zh' ? '发生错误: ' : 'Error: ';
    yield `${prefix}${errorMessage}`;
  }
}