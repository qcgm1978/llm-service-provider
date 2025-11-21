import { generatePrompt, StreamDefinitionOptions } from './llmService'
import { getItem, getEnv } from './utils'

const API_URL = 'https://api.ydc-index.io/search'

function getYouChatApiKey (): string | undefined {
  try {
    const savedApiKey = getItem('YOUCHAT_API_KEY')
    if (savedApiKey) {
      return savedApiKey
    }

    return getEnv('YOUCHAT_API_KEY')
  } catch (e) {
    console.error('Error getting YouChat API key:', e)
  }

  return undefined
}

export function setYouChatApiKey (apiKey: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('YOUCHAT_API_KEY', apiKey)
  }
}

export function clearYouChatApiKey (): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('YOUCHAT_API_KEY')
  }
}

export function hasYouChatApiKey (): boolean {
  const apiKey = getYouChatApiKey();
  return !!apiKey && apiKey.length > 0;
}

export async function* streamDefinition(options: StreamDefinitionOptions): AsyncGenerator<string, void, undefined> {
  const { topic, language = 'zh' } = options;
  let accumulatedContent = '';
  
  const prompt = generatePrompt(topic, language);
  const apiKey = getYouChatApiKey();
  
  if (!apiKey) {
    const errorMsg = 
      language === 'zh'
        ? 'Error: YOUCHAT_API_KEY is not configured. Please configure your API key in the settings to continue.'
        : 'Error: YOUCHAT_API_KEY is not configured. Please configure your API key in the settings to continue.';
    yield errorMsg;
    return;
  }

  try {
    // 构建请求头和参数
    const headers = {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    };
    
    const params = new URLSearchParams();
    params.append('query', prompt);

    // 发送请求
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: headers,
      // mode: 'no-cors'
    });

    if (!response.ok) {
      const msg = language === 'zh' ? 'API请求失败' : 'API request failed';
      throw new Error(`${msg}: ${response.statusText}`);
    }

    // 获取JSON响应
    const data = await response.json();
    
    // 将结果作为流式输出返回
    const resultText = JSON.stringify(data, null, 2);
    
    // 模拟流式输出，逐字符发送
    for (let i = 0; i < resultText.length; i++) {
      yield resultText[i];
      // 添加小延迟以模拟实际流
      await new Promise(resolve => setTimeout(resolve, 1));
    }

  } catch (error) {
    console.error('Error from YouChat API:', error);
    const msg = language === 'zh' ? '网络错误，请检查连接' : 'Please check your network connection';
    throw new Error(`${msg}`);
  }
}
