import { generatePrompt } from "./llmService"; 

// 定义Moonshot服务的流定义函数
export async function* streamDefinition(
  topic: string,
  language: "zh" | "en" = "zh",
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  try {
    // 生成提示词
    const prompt = generatePrompt(topic, language, category, context);
    
    // 获取API密钥
    const llmApiKey = localStorage.getItem('MOONSHOT_API_KEY') || '';
    
    if (!llmApiKey.trim()) {
      throw new Error('Moonshot API key is not set');
    }
    
    // 设置API请求参数
    const apiUrl = 'https://api.moonshot.cn/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${llmApiKey}`
    };
    const body = JSON.stringify({
      model: 'moonshot-v1-8k',
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 2000,
      stream: true
    });
    
    // 发送请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body
    });
    
    if (!response.ok) {
      throw new Error(`Moonshot API request failed with status: ${response.status}`);
    }
    
    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }
    
    const decoder = new TextDecoder();
    let partialLine = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      partialLine += chunk;
      
      // 分割行
      const lines = partialLine.split('\n');
      partialLine = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.substring(5).trim();
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices.length > 0) {
              const content = parsed.choices[0].delta?.content || '';
              if (content) {
                yield content;
              }
            }
          } catch (error) {
            console.error('Failed to parse Moonshot API response:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Moonshot service error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const prefix = language === 'zh' ? '发生错误: ' : 'Error: ';
    yield `${prefix}${errorMessage}`;
  }
}

// 更新API密钥的函数
export const updateApiKey = (key: string): void => {
  // 这里可以添加任何需要在API密钥更新时执行的逻辑
  console.log('Moonshot API key updated');
};