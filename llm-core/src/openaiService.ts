import { generatePrompt } from './llmService'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_MODEL = 'gpt-3.5-turbo'

function getApiKey(): string | undefined {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedApiKey = localStorage.getItem('OPENAI_API_KEY')
    if (savedApiKey) {
      return savedApiKey
    }
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env.OPENAI_API_KEY
  }

  return undefined
}

export function setApiKey(apiKey: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('OPENAI_API_KEY', apiKey)
  }
}

export function clearApiKey(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('OPENAI_API_KEY')
  }
}

export function hasApiKey(): boolean {
  return !!getApiKey()
}

export async function* streamDefinition(
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const apiKey = getApiKey()
  let accumulatedContent = ''
  if (!apiKey) {
    const errorMsg =
      language === 'zh'
        ? 'Error: OPENAI_API_KEY is not configured. Please configure your API key in the settings to continue.'
        : 'Error: OPENAI_API_KEY is not configured. Please configure your API key in the settings to continue.'
    yield errorMsg
    return
  }

  const prompt = generatePrompt(topic, language, category, context)
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
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
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              if (accumulatedContent) {
                yield accumulatedContent
                accumulatedContent = ''
              }
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.choices?.[0]?.delta?.content) {
                accumulatedContent += parsed.choices[0].delta.content
                if (accumulatedContent.length >= 40) {
                  yield accumulatedContent
                  accumulatedContent = ''
                }
              }
            } catch (e) {}
          }
        }
      }
    } finally {
      if (accumulatedContent) {
        yield accumulatedContent
      }
      reader.releaseLock()
    }
  } catch (error) {
    if (accumulatedContent) {
      yield accumulatedContent
    }
    console.error('Error streaming from OpenAI:', error)
    const msg =
      language === 'zh'
        ? `请配置有效的OPENAI_API_KEY或检查VPN设置`
        : `Please configure a valid OPENAI_API_KEY or check your VPN settings`
    const message= `Error: ${error instanceof Error ? error.message : "An unknown error occurred."}. ${msg}`
    throw new Error(message)
  }
}