import { GoogleGenAI } from '@google/genai'
import { generatePrompt, StreamDefinitionOptions } from './llmService'
import { getItem, setItem, removeItem, getEnv } from "./utils"

let apiKey: string | null = null

if (typeof window !== 'undefined') {
  const key = getItem('GEMINI_API_KEY') || getEnv('GEMINI_API_KEY');
  apiKey = key !== undefined ? key : null;
}


let ai: GoogleGenAI | null = null
if (apiKey) {
  ai = new GoogleGenAI({ apiKey: apiKey })
}

const artModelName = 'gemini-2.5-flash'
const textModelName = 'gemini-2.5-flash-lite'

export const updateApiKey = (newApiKey: string | null): void => {
  apiKey = newApiKey
  if (newApiKey) {
    ai = new GoogleGenAI({ apiKey: newApiKey })
  } else {
    ai = null
  }
}

export async function* streamDefinition (options: StreamDefinitionOptions): AsyncGenerator<string, void, undefined> {
  const { topic, language = 'zh', category, context } = options;
  if (!ai) {
    yield 'Error: GEMINI_API_KEY is not configured. Please check your settings to continue.'
    return
  }

  const prompt = generatePrompt(topic, language, context)

  try {
    const response = await ai.models.generateContentStream({
      model: textModelName,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    })

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text
      }
    }
  } catch (error) {
    const msg = JSON.parse(JSON.stringify(error)).message
    let message: string
    if(msg) {
      message = JSON.parse(msg).error
    } else {
      message = language === 'zh' ? '网络错误，请开启或检查VPN设置' : 'Please check your network connection or try enabling VPN'
    }
    throw new Error(message)
  }
}
