import { generatePrompt } from './llmService'
import { getItem, getEnv } from './utils'

const LONGCHAT_API_URL = 'https://api.longcat.chat/openai/v1/chat/completions'
const LONGCHAT_MODEL = 'LongCat-Flash-Chat'

function getLongchatApiKey (): string | undefined {
  try {
    const savedApiKey = getItem('LONGCHAT_API_KEY')
    if (savedApiKey) {
      return savedApiKey
    }

    return getEnv('LONGCHAT_API_KEY')
  } catch (e) {
    console.error('Error getting LongChat API key:', e)
  }

  return undefined
}

export function hasLongchatApiKey(): boolean {
  const apiKey = getLongchatApiKey();
  return !!apiKey;
}

export function setLongchatApiKey(apiKey: string): void {
  if (apiKey) {
    localStorage.setItem('LONGCHAT_API_KEY', apiKey);
  } else {
    localStorage.removeItem('LONGCHAT_API_KEY');
  }
}

export function clearLongchatApiKey(): void {
  localStorage.removeItem('LONGCHAT_API_KEY');
}

import { StreamDefinitionOptions } from './llmService';

export async function* streamDefinition(options: StreamDefinitionOptions): AsyncGenerator<string, void, undefined> {
  const { topic, language = 'zh', category, context, responseFormat } = options;
  const apiKey = getLongchatApiKey();
  let accumulatedContent = '';
  if (!apiKey) {
    const errorMsg = 
      language === 'zh'
        ? 'Error: LONGCHAT_API_KEY is not configured. Please configure your API key in the settings to continue.'
        : 'Error: LONGCHAT_API_KEY is not configured. Please configure your API key in the settings to continue.';
    yield errorMsg;
    return;
  }

  const prompt = generatePrompt(topic, language, context);
  try {
    const response = await fetch(LONGCHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: LONGCHAT_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
        ...(responseFormat === 'json' && {
          response_format: {
            type: 'json_object'
          }
        })
      })
    })

    if (!response.ok) {
      throw new Error(await response.json().then(json => json.error.message))
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5)
            if (data === '[DONE]') {
              break
            }

            try {
                const parsed = JSON.parse(data)
                if (parsed.choices?.[0]?.delta?.content) {
                  const newContent = parsed.choices[0].delta.content
                  accumulatedContent += newContent
                  yield newContent
                }
              } catch (e) {
                console.error('Error parsing LongChat response:', e)
              }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    console.error('Error in LongChat stream:', error instanceof Error ? error.message : 'An unknown error occurred')
    const msg =
      language === "zh"
        ? `请配置LONGCHAT_API_KEY`
        : `Please configure LONGCHAT_API_KEY`;
    const errorMessage = `Error: ${error instanceof Error ? error.message : "An unknown error occurred."}. ${msg}`;
    throw new Error(errorMessage);
  }
}