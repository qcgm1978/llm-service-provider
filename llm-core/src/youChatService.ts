import { generatePrompt, StreamDefinitionOptions } from './llmService'
import { getItem, getEnv } from './utils'
import queryString from 'query-string'
import { SSE } from 'sse.js'

const YOUCHAT_API_URL = 'https://you.com/api/streamingSearch'

function getApiKey (): string | undefined {
  return getItem('YOUCHAT_API_KEY') || getEnv('YOUCHAT_API_KEY')
}

export function setApiKey (apiKey: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('YOUCHAT_API_KEY', apiKey)
  }
}

export function clearApiKey (): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('YOUCHAT_API_KEY')
  }
}

export function hasApiKey (): boolean {
  return true
}

interface ChatMessage {
  question: string;
  answer: string;
}

// 生成UUID的简单函数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let chatContext = {
  chatId: generateUUID(),
  chatHistory: [] as ChatMessage[]
}

function getChatContext () {
  return chatContext
}

function setChatContext (context: typeof chatContext) {
  chatContext = context
}

// 添加全局配置变量来控制是否允许 chat 字段
let allowChatField = false

export function setAllowChatField(allow: boolean): void {
  allowChatField = allow
}

export function getAllowChatField(): boolean {
  return allowChatField
}

export async function* streamDefinition(options: StreamDefinitionOptions): AsyncGenerator<string, void, undefined> {
  const { topic, language = 'zh', category, context, allowChatField } = options;
  // youchat不需要API密钥
  let accumulatedContent = '';
  
  // 更新allowChatField全局变量
  if (allowChatField !== undefined) {
    setAllowChatField(allowChatField);
  }
  
  const prompt = generatePrompt(topic, language, context);
  const contextData = getChatContext()
  let text = ''

  try {
    const queue: string[] = []
    let isDone = false
    let resolvePromise: (() => void) | null = null
    
    let streamError: Event | null = null
    
    const streamPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
      try {
        const headers = {
          accept: 'text/event-stream',
        }
        
        const payload: any = {
          q: prompt,
          domain: 'youchat',
          chatId: contextData.chatId,
          queryTraceId: contextData.chatId,
        }
        
        if (allowChatField) {
          payload.chat = JSON.stringify(contextData.chatHistory)
        }

        const source = new SSE(
          `${YOUCHAT_API_URL}?${queryString.stringify(payload)}`,
          {
            headers,
            withCredentials: false,
          }
        )

        source.addEventListener('youChatToken', (event: Event) => {
          try {
            const data = JSON.parse((event as MessageEvent).data)
            if (data.youChatToken) {
              text += data.youChatToken
              queue.push(data.youChatToken)
            }
          } catch (e) {}
        })

        source.addEventListener('done', () => {
          setChatContext({
            chatId: contextData.chatId,
            chatHistory: [
              ...contextData.chatHistory,
              {
                question: prompt,
                answer: text,
              },
            ],
          })
          isDone = true
          if (resolvePromise) resolvePromise();
        })

        source.addEventListener('error', (event: Event) => {
          console.error(event)
          streamError = event
          isDone = true
          if (resolvePromise) resolvePromise();
        })

        source.stream()
      } catch (err) {
        streamError = err as Event
        isDone = true
        if (resolvePromise) resolvePromise();
      }
    })

    while (!isDone || queue.length > 0) {
      if (queue.length > 0) {
        yield queue.shift()!;
      } else {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    await streamPromise;

    if (streamError) {
      throw streamError;
    }

  } catch (error) {
    console.error('Error streaming from YouChat:', error)
    const msg = language === 'zh' ? '网络错误，请开启或检查VPN设置' : 'Please check your network connection or try enabling VPN'
    throw new Error(`${msg}`)
  }
}
