import {
  ServiceProvider,
  setDeepSeekApiKey,
  setGeminiApiKey,
  setXunfeiApiKey,
  setXunfeiApiSecret,
  setGroqApiKey,
  setOpenAiApiKey,
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  hasXunfeiApiKey,
  hasXunfeiApiSecret,
  hasGroqApiKey,
  hasOpenAiApiKey,
  hasDoubaoApiKey,
  setDoubaoApiKey,
  setOpenRouterApiKey,
  hasOpenRouterApiKey,
} from '../llm-core/src/index';

// 定义接口
export interface ProviderState {
  apiKey: string;
  apiSecret: string;
  isValid: boolean;
}

// 获取服务提供商对应的API密钥信息
export const getProviderCredentials = (provider: ServiceProvider): ProviderState => {
  const state: ProviderState = {
    apiKey: '',
    apiSecret: '',
    isValid: false
  };

  switch (provider) {
    case ServiceProvider.DEEPSEEK:
      state.apiKey = localStorage.getItem('DEEPSEEK_API_KEY') || '';
      state.isValid = hasDeepSeekApiKey();
      break;
    case ServiceProvider.GEMINI:
      state.apiKey = localStorage.getItem('GEMINI_API_KEY') || '';
      state.isValid = hasGeminiApiKey();
      break;
    case ServiceProvider.GROQ:
      state.apiKey = localStorage.getItem('GROQ_API_KEY') || '';
      state.isValid = hasGroqApiKey();
      break;
    case ServiceProvider.XUNFEI:
      state.apiKey = localStorage.getItem('XUNFEI_API_KEY') || '';
      state.apiSecret = localStorage.getItem('XUNFEI_API_SECRET') || '';
      state.isValid = hasXunfeiApiKey() && hasXunfeiApiSecret();
      break;
    case ServiceProvider.OPENAI:
      state.apiKey = localStorage.getItem('OPENAI_API_KEY') || '';
      state.isValid = hasOpenAiApiKey();
      break;
    case ServiceProvider.DOUBAO:
      state.apiKey = localStorage.getItem('DOUBAO_API_KEY') || '';
      state.isValid = hasDoubaoApiKey();
      break;
    case ServiceProvider.OPENROUTER:
      state.apiKey = localStorage.getItem('OPENROUTER_API_KEY') || '';
      state.isValid = hasOpenRouterApiKey();
      break;
    case ServiceProvider.YOUCHAT:
      state.isValid = true;
      break;
    default:
      break;
  }

  return state;
};

// 保存服务提供商的API密钥
export const saveProviderCredentials = (provider: ServiceProvider, apiKey: string, apiSecret?: string): boolean => {
  let saved = false;
  
  switch (provider) {
    case ServiceProvider.DEEPSEEK:
      if (apiKey.trim()) {
        setDeepSeekApiKey(apiKey.trim());
        saved = true;
      }
      break;
    case ServiceProvider.GEMINI:
      if (apiKey.trim()) {
        setGeminiApiKey(apiKey.trim());
        saved = true;
      }
      break;
    case ServiceProvider.GROQ:
      if (apiKey.trim()) {
        setGroqApiKey(apiKey.trim());
        saved = true;
      }
      break;
    case ServiceProvider.XUNFEI:
      if (apiKey.trim() && apiSecret?.trim()) {
        setXunfeiApiKey(apiKey.trim());
        setXunfeiApiSecret(apiSecret.trim());
        saved = true;
      }
      break;
    case ServiceProvider.OPENAI:
      if (apiKey.trim()) {
        setOpenAiApiKey(apiKey.trim());
        saved = true;
      }
      break;
    case ServiceProvider.DOUBAO:
      if (apiKey.trim()) {
        setDoubaoApiKey(apiKey.trim());
        saved = true;
      }
      break;
    case ServiceProvider.OPENROUTER:
      if (apiKey.trim()) {
        setOpenRouterApiKey(apiKey.trim());
        saved = true;
      }
      break;
    default:
      break;
  }

  return saved;
};

// 清除服务提供商的API密钥
export const clearProviderCredentials = (provider: ServiceProvider): void => {
  switch (provider) {
    case ServiceProvider.DEEPSEEK:
      setDeepSeekApiKey('');
      break;
    case ServiceProvider.GEMINI:
      setGeminiApiKey('');
      break;
    case ServiceProvider.GROQ:
      setGroqApiKey('');
      break;
    case ServiceProvider.XUNFEI:
      setXunfeiApiKey('');
      setXunfeiApiSecret('');
      break;
    case ServiceProvider.OPENROUTER:
      setOpenRouterApiKey('');
      break;
    default:
      break;
  }
};

// 验证API密钥是否有效
export const validateCredentials = (provider: ServiceProvider, apiKey: string, apiSecret?: string): boolean => {
  if (provider === ServiceProvider.XUNFEI) {
    return apiKey.length > 0 && (apiSecret?.length || 0) > 0;
  } else if (provider === ServiceProvider.YOUCHAT) {
    return true;
  }
  return apiKey.length > 0;
};

// 获取服务提供商的API密钥配置链接
export const getProviderApiKeyLink = (provider: ServiceProvider): string => {
  switch (provider) {
    case ServiceProvider.XUNFEI:
      return 'https://console.xfyun.cn/app/myapp';
    case ServiceProvider.DEEPSEEK:
      return 'https://platform.deepseek.com/';
    case ServiceProvider.GEMINI:
      return 'https://makersuite.google.com/app/apikey';
    case ServiceProvider.GROQ:
      return 'https://console.groq.com/keys';
    case ServiceProvider.OPENAI:
      return 'https://platform.openai.com/api-keys';
    case ServiceProvider.DOUBAO:
      return 'https://console.volcengine.com/vei/aigateway/overview?region=cn-beijing';
    case ServiceProvider.OPENROUTER:
      return 'https://openrouter.ai/settings/keys';
    default:
      return '#';
  }
};

// 获取服务提供商的显示名称
export const getProviderDisplayName = (provider: ServiceProvider, language: 'zh' | 'en' = 'zh'): string => {
  const names: Record<ServiceProvider, Record<'zh' | 'en', string>> = {
    [ServiceProvider.XUNFEI]: { zh: '讯飞星火', en: 'Xunfei' },
    [ServiceProvider.DEEPSEEK]: { zh: 'DeepSeek', en: 'DeepSeek' },
    [ServiceProvider.GEMINI]: { zh: 'Gemini', en: 'Gemini' },
    [ServiceProvider.GROQ]: { zh: 'Meta', en: 'Meta' }, // 注意：这里保持原来的显示名称为Meta
    [ServiceProvider.OPENAI]: { zh: 'OpenAI', en: 'OpenAI' },
    [ServiceProvider.DOUBAO]: { zh: '豆包', en: 'Doubao' },
    [ServiceProvider.OPENROUTER]: { zh: 'OpenRouter', en: 'OpenRouter' },
    [ServiceProvider.YOUCHAT]: { zh: 'YouChat', en: 'YouChat' }
  };

  return names[provider]?.[language] || provider;
};