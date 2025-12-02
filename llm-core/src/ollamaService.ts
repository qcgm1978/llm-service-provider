import { generatePrompt } from './llmService'
import { getItem, getEnv } from './utils'

const OLLAMA_API_URL = 'http://localhost:11434/api/generate'
const DEFAULT_OLLAMA_MODEL = 'llama3.2:latest'

// 定义Ollama模型列表
export const OLLAMA_MODELS = {
  'deepseek-r1:8b': 'Deepseek R1 8B',
  'gemma3:1b': 'Gemma 3 1B',
  'llama3.2:latest': 'Llama 3.2',
  // 'llama3': 'Llama 3',
  // 'llama3-chinese': 'Llama 3 Chinese',
  // 'gemma': 'Gemma',
  // 'mistral': 'Mistral',
  // 'gemma:2b': 'Gemma 2B',
  // 'llama2': 'Llama 2',
  // 'phi3': 'Phi-3',
  // 'qwen2': 'Qwen 2',
  // 'glm4': 'GLM-4'
};

function getOllamaModel(): string {
  try {
    const savedModel = getItem('OLLAMA_MODEL')
    if (savedModel && Object.keys(OLLAMA_MODELS).includes(savedModel)) {
      return savedModel
    }
    return DEFAULT_OLLAMA_MODEL
  } catch (e) {
    console.error('Error getting Ollama model:', e)
  }
  return DEFAULT_OLLAMA_MODEL
}

export function setOllamaModel(model: string): void {
  if (model && Object.keys(OLLAMA_MODELS).includes(model)) {
    localStorage.setItem('OLLAMA_MODEL', model)
  }
}

export function getSelectedModel(): string {
  return getOllamaModel()
}

export function setSelectedModel(model: string): void {
  setOllamaModel(model)
}

export async function hasOllamaConnection(): Promise<boolean> {
  try {
    // 测试Ollama服务连接性，使用简单的ping或models接口
    const testUrl = 'http://localhost:11434/api/tags'
    
    // 使用Promise.race实现超时处理
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 3000)
    })
    
    const fetchPromise = fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const response = await Promise.race([fetchPromise, timeoutPromise])
    return response.ok
  } catch (error) {
    console.error('Ollama connection test failed:', error)
    return false
  }
}

import { StreamDefinitionOptions } from './llmService';

export async function* streamDefinition(options: StreamDefinitionOptions): AsyncGenerator<string, void, undefined> {
  const { topic, language = 'zh', category, context, responseFormat } = options;
  const model = getOllamaModel();
  let accumulatedContent = '';

  // Ollama是本地服务，不需要API密钥，但需要检查连接
  try {
    const isConnected = await hasOllamaConnection();
    if (!isConnected) {
      const errorMsg = 
        language === 'zh'
          ? 'Error: 无法连接到Ollama本地服务。请确保Ollama服务正在运行。'
          : 'Error: Cannot connect to Ollama local service. Please make sure Ollama service is running.';
      yield errorMsg;
      return;
    }
  } catch (error) {
    const errorMsg = 
      language === 'zh'
        ? 'Error: 检查Ollama连接时出错。请确保Ollama服务正在运行。'
        : 'Error: Failed to check Ollama connection. Please make sure Ollama service is running.';
    yield errorMsg;
    return;
  }

  const prompt = generatePrompt(topic, language, context);
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: true,
        options: {
          temperature: 0.7,
          max_tokens: -1
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API request failed with status: ${response.status}`)
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
          if (line.trim() === '') continue

          try {
            const parsed = JSON.parse(line)
            if (parsed.response) {
              const newContent = parsed.response
              accumulatedContent += newContent
              yield newContent
            }
          } catch (e) {
            console.error('Error parsing Ollama response:', e)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    console.error('Error in Ollama stream:', error instanceof Error ? error.message : 'An unknown error occurred')
    const msg = language === 'zh' ? '请确保Ollama服务正在本地运行' : 'Please make sure Ollama service is running locally'
    const errorMessage = `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}. ${msg}`
    yield errorMessage
  }
}