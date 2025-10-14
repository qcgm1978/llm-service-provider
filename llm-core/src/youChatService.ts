import { generatePrompt } from './llmService'
import queryString from 'query-string'
import { SSE } from 'sse.js'
import { v4 as uuidv4 } from 'uuid'

const YOUCHAT_API_URL = 'https://you.com/api/streamingSearch'

function getApiKey (): string | undefined {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedApiKey = localStorage.getItem('YOUCHAT_API_KEY')
    if (savedApiKey) {
      return savedApiKey
    }
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env.YOUCHAT_API_KEY
  }

  return undefined
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

let chatContext = {
  chatId: uuidv4(),
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

export async function* streamDefinition (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const prompt = generatePrompt(topic, language, category, context)
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
