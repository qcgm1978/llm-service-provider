import { generatePrompt, StreamDefinitionOptions } from './llmService'
import request_xunfei from './xunfei'
import { getItem, getEnv } from './utils'

// 同步对话函数
// 流式对话函数
export async function* streamChat(prompt: string): AsyncGenerator<string, void, undefined> {
  const getApiKey = (): string => {
    return getItem('XUNFEI_API_KEY') || getEnv('VITE_XUNFEI_API_KEY') || '';
  };

  const getApiSecret = (): string => {
    return getItem('XUNFEI_API_SECRET') || getEnv('VITE_XUNFEI_API_SECRET') || '';
  };

  const apiKey = getApiKey();
  const apiSecret = getApiSecret();
  
  if (!apiKey || !apiSecret) {
    yield "请配置有效的XUNFEI_API_KEY和XUNFEI_API_SECRET";
    return;
  }
  
  const reader = await request_xunfei(
    apiKey,
    apiSecret,
    'wss://spark-api.xf-yun.com/v1/x1',
    prompt
  )

  let accumulatedContent = ''

  if (reader) {
    const decoder = new TextDecoder()
    let buffer = ''
    let doneReading = false

    while (!doneReading) {
      const result = await reader.read()
      if (result.done) {
        doneReading = true
        break
      }

      const value = result.value || new Uint8Array(0)
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            if (accumulatedContent) {
              yield accumulatedContent
            }
            reader.releaseLock()
            return
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.choices?.[0]?.delta?.content) {
              accumulatedContent += parsed.choices[0].delta.content
              yield accumulatedContent
              await new Promise(resolve => setTimeout(resolve, 30))
            }
          } catch (e) {}
        }
      }
    }
    
    if (accumulatedContent) {
      yield accumulatedContent
    }
    reader.releaseLock()
  }

  yield "无法连接到讯飞API";
}

// 同步对话函数
export async function chat(prompt: string): Promise<string> {
  const getApiKey = (): string => {
    return getItem('XUNFEI_API_KEY') || getEnv('VITE_XUNFEI_API_KEY') || '';
  };

  const getApiSecret = (): string => {
    return getItem('XUNFEI_API_SECRET') || getEnv('VITE_XUNFEI_API_SECRET') || '';
  };

  const apiKey = getApiKey();
  const apiSecret = getApiSecret();
  
  if (!apiKey || !apiSecret) {
    return "请配置有效的XUNFEI_API_KEY和XUNFEI_API_SECRET";
  }
  
  const reader = await request_xunfei(
    apiKey,
    apiSecret,
    'wss://spark-api.xf-yun.com/v1/x1',
    prompt
  )

  let fullContent = ''

  if (reader) {
    const decoder = new TextDecoder()
    let buffer = ''
    let doneReading = false

    while (!doneReading) {
      const result = await reader.read()
      if (result.done) {
        doneReading = true
        break
      }

      const value = result.value || new Uint8Array(0)
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            reader.releaseLock()
            return fullContent
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.choices?.[0]?.delta?.content) {
              fullContent += parsed.choices[0].delta.content
            }
          } catch (e) {}
        }
      }
    }
    
    reader.releaseLock()
  }

  return "无法连接到讯飞API";
}

// 流式定义生成函数
export async function* streamDefinition(options: StreamDefinitionOptions): AsyncGenerator<string, void, undefined> {
  const { topic, language = 'zh', category, context } = options;
  const getApiKey = (): string => {
    return getItem('XUNFEI_API_KEY') || getEnv('VITE_XUNFEI_API_KEY') || '';
  };

  const getApiSecret = (): string => {
    return getItem('XUNFEI_API_SECRET') || getEnv('VITE_XUNFEI_API_SECRET') || '';
  };

  const apiKey = getApiKey();
  const apiSecret = getApiSecret();
  
  if (!apiKey || !apiSecret) {
    yield language === "zh"
      ? `请配置有效的XUNFEI_API_KEY和XUNFEI_API_SECRET`
      : `Please configure valid XUNFEI_API_KEY and XUNFEI_API_SECRET`;
    return;
  }
  
  const prompt = generatePrompt(topic, language, context);

  const reader = await request_xunfei(
    apiKey,
    apiSecret,
    'wss://spark-api.xf-yun.com/v1/x1',
    prompt
  )

  let accumulatedContent = ''

  if (reader) {
    const decoder = new TextDecoder()
    let buffer = ''
    let doneReading = false

    while (!doneReading) {
      const result = await reader.read()
      if (result.done) {
        doneReading = true
        break
      }

      const value = result.value || new Uint8Array(0)
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            if (accumulatedContent) {
              yield accumulatedContent
            }
            reader.releaseLock()
            return
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.choices?.[0]?.delta?.content) {
              accumulatedContent += parsed.choices[0].delta.content
              yield accumulatedContent
              accumulatedContent = ''
              await new Promise(resolve => setTimeout(resolve, 30))
            }
          } catch (e) {}
        }
      }
    }
    
    if (accumulatedContent) {
      yield accumulatedContent
    }
    reader.releaseLock()
  }

  const errorPrefix = language === 'zh'
    ? `无法为"${topic}"生成内容: `
    : `Could not generate content for "${topic}": `
  yield `${errorPrefix}无法连接到讯飞API`;
}
