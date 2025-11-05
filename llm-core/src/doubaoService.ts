import { getItem, getEnv } from './utils';

const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
let DOUBAO_MODEL = 'doubao-1-5-pro-32k-250115';

// 设置模型
export const setModel = (model: string): void => {
  DOUBAO_MODEL = model;
};

// 获取 API Key
const getApiKey = (): string => {
  return getItem('DOUBAO_API_KEY') || getEnv('DOUBAO_API_KEY') || '';
};

// 更新 API Key
export const updateApiKey = (key: string): void => {
  // 这里可以做一些验证或其他操作
};

// 处理豆包 API 响应
const processResponse = async (response: Response): Promise<ReadableStreamDefaultReader | null> => {
  if (!response.ok) {
    return null;
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    return null;
  }
  
  return reader;
};

// 解析豆包 API 流式响应
const parseChunk = (chunk: string): string => {
  const lines = chunk.split('\n');
  let content = '';
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    if (line.startsWith('data:')) {
      const data = line.substring(5).trim();
      if (data === '[DONE]') break;
      
      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch (e) {
        return '';
      }
      
      const delta = parsed.choices[0]?.delta;
      if (delta?.content) {
        content += delta.content;
      }
    }
  }
  
  return content;
};

// 处理聊天请求
export const chat = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return '请先设置豆包 API Key';
  }
  
  const response = await fetch(DOUBAO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: DOUBAO_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false
    })
  });
  
  if (!response.ok) {
    return 'API请求失败，状态码: ' + response.status;
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content || '没有获取到响应内容';
}

// 处理流式聊天请求
export async function* streamChat(prompt: string): AsyncGenerator<string, void, undefined> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    yield '请先设置豆包 API Key';
    return;
  }
  
  const response = await fetch(DOUBAO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: DOUBAO_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: true
    })
  });
  
  if (!response.ok) {
    yield 'API请求失败，状态码: ' + response.status;
    return;
  }
  
  const reader = await processResponse(response);
  if (!reader) {
    yield '无法获取响应体';
    return;
  }
  
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const content = parseChunk(chunk);
    
    if (content) {
      yield content;
    }
  }
}

// 处理定义生成请求
export async function* streamDefinition(
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    yield '请先设置豆包 API Key';
    return;
  }
  
  // 导入generatePrompt以避免循环依赖
  const { generatePrompt } = await import('./llmService');
  const prompt = generatePrompt(topic, language, context);
  
  const response = await fetch(DOUBAO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: DOUBAO_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: true
    })
  });
  
  if (!response.ok) {
    const msg =
      language === "zh"
        ? 'API请求失败，请配置有效的豆包 API Key'
        : 'API request failed, please configure valid Doubao API Key';
    yield msg;
    return;
  }
  
  const reader = await processResponse(response);
  if (!reader) {
    yield '无法获取响应体';
    return;
  }
  
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const content = parseChunk(chunk);
    
    if (content) {
      yield content;
    }
  }
}
