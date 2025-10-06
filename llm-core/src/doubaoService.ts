import { generatePrompt } from './llmService';

// 豆包 API 配置
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const DOUBAO_MODEL = 'doubao-1-5-pro-32k-250115';

// 获取 API Key
const getApiKey = (): string => {
  return localStorage.getItem('DOUBAO_API_KEY') || '';
};

// 更新 API Key
export const updateApiKey = (key: string): void => {
  // 这里可以做一些验证或其他操作
};

// 处理豆包 API 响应
const processResponse = async (response: Response): Promise<ReadableStreamDefaultReader> => {
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }
  
  return reader;
};

// 解析豆包 API 流式响应
const parseChunk = (chunk: string): string => {
  try {
    const lines = chunk.split('\n');
    let content = '';
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      if (line.startsWith('data:')) {
        const data = line.substring(5).trim();
        if (data === '[DONE]') break;
        
        const parsed = JSON.parse(data);
        const delta = parsed.choices[0]?.delta;
        if (delta?.content) {
          content += delta.content;
        }
      }
    }
    
    return content;
  } catch (error) {
    console.error('Error parsing chunk:', error);
    return '';
  }
};

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
  
  const prompt = generatePrompt(topic, language, category, context);
  
  try {
    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
    
    const reader = await processResponse(response);
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '豆包服务请求失败';
    yield `错误: ${errorMessage}`;
  }
}