import { ServiceProvider } from '../llm-core/src/index';

export interface ProviderNames {
  [key: string]: Record<'zh' | 'en', string>;
}

export const providerNamesConfig: ProviderNames = {
  [ServiceProvider.XUNFEI]: { zh: '讯飞星火', en: 'Xunfei' },
  [ServiceProvider.DEEPSEEK]: { zh: '深度求索', en: 'DeepSeek' },
  [ServiceProvider.GEMINI]: { zh: 'Gemini', en: 'Gemini' },
  [ServiceProvider.GROQ]: { zh: 'Groq', en: 'Groq' },
  [ServiceProvider.OPENAI]: { zh: '开放AI', en: 'OpenAI' },
  [ServiceProvider.DOUBAO]: { zh: '豆包', en: 'Doubao' },
  [ServiceProvider.OPENROUTER]: { zh: 'OpenRouter', en: 'OpenRouter' },
  [ServiceProvider.YOUCHAT]: { zh: '优聊', en: 'YouChat' },
  [ServiceProvider.MOONSHOT]: { zh: '月之暗面', en: 'Moonshot' }
};