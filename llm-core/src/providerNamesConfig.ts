import { ServiceProvider } from './llmService';

export interface ProviderNames {
  [key: string]: Record<'zh' | 'en', string>;
}

// 直接导出，不通过index中转
export const providerNamesConfig = {
  [ServiceProvider.XUNFEI]: { zh: '讯飞星火', en: 'Xunfei' },
  [ServiceProvider.DEEPSEEK]: { zh: 'DeepSeek', en: 'DeepSeek' },
  [ServiceProvider.GEMINI]: { zh: 'Gemini', en: 'Gemini' },
  [ServiceProvider.GROQ]: { zh: 'Groq', en: 'Groq' },
  [ServiceProvider.OPENAI]: { zh: 'OpenAI', en: 'OpenAI' },
  [ServiceProvider.DOUBAO]: { zh: '豆包', en: 'Doubao' },
  [ServiceProvider.OPENROUTER]: { zh: 'OpenRouter', en: 'OpenRouter' },
  [ServiceProvider.MOONSHOT]: { zh: '月之暗面', en: 'Moonshot' },
  [ServiceProvider.IFLOW]: { zh: '心流', en: 'iFlow' },
  [ServiceProvider.HUNYUAN]: { zh: '混元', en: 'Hunyuan' },
  [ServiceProvider.YOUCHAT]: { zh: 'YouChat', en: 'YouChat' },
  [ServiceProvider.LONGCHAT]: { zh: '美团', en: 'LongChat' },
  [ServiceProvider.OLLAMA]: { zh: 'Ollama本地', en: 'Ollama Local' }
};