import {
  ServiceProvider,
  setDeepSeekApiKey,
  setGeminiApiKey,
  setXunfeiApiKey,
  setXunfeiApiSecret,
  setGroqApiKey,
  setOpenAiApiKey,
  setIflowApiKey,
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
  setMoonshotApiKey,
  hasMoonshotApiKey,
  hasIflowApiKey,
  setYouChatApiKey,
  hasYouChatApiKey
} from './index';
import { setLongchatApiKey, hasLongchatApiKey, clearLongchatApiKey } from './longchatService';
import { hasOllamaConnection } from './ollamaService';
import { setApiKey as setHunyuanApiKey, hasApiKey as hasHunyuanApiKey, clearApiKey as clearHunyuanApiKey } from './hunyuanService';
import { clearYouChatApiKey } from './youChatService';

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
    case ServiceProvider.MOONSHOT:
      state.apiKey = localStorage.getItem('MOONSHOT_API_KEY') || '';
      state.isValid = hasMoonshotApiKey();
      break;
    case ServiceProvider.IFLOW:
      state.apiKey = localStorage.getItem('IFLOW_API_KEY') || '';
      state.isValid = hasIflowApiKey();
      break;
    case ServiceProvider.YOUCHAT:
      state.apiKey = localStorage.getItem('YOUCHAT_API_KEY') || '';
      state.isValid = hasYouChatApiKey();
      break;
    case ServiceProvider.HUNYUAN:
      state.apiKey = localStorage.getItem('HUNYUAN_API_KEY') || '';
      state.isValid = hasHunyuanApiKey();
      break;
    case ServiceProvider.LONGCHAT:
      state.apiKey = localStorage.getItem('LONGCHAT_API_KEY') || '';
      state.isValid = hasLongchatApiKey();
      break;
    case ServiceProvider.OLLAMA:
      state.apiKey = "本地服务不需要API密钥";
      // 由于hasOllamaConnection现在是异步函数，这里返回true
      // 实际连接检查在使用时进行
      state.isValid = true;
      break;
    default:
      break;
  }

  return state;
};

// 简化的服务初始化函数，不再需要动态注册
async function initializeService(provider: ServiceProvider): Promise<void> {
  // 由于使用静态导入，这里不再需要动态注册
  // 各服务的streamDefinition已在llmService.ts中静态导入
  return Promise.resolve();
}

// 保存服务提供商的API密钥并自动注册服务
export const saveProviderCredentials = async (provider: ServiceProvider, apiKey: string, apiSecret?: string): Promise<boolean> => {
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
    case ServiceProvider.MOONSHOT:
      if (apiKey.trim()) {
        setMoonshotApiKey(apiKey.trim());
        saved = true;
      }
      break;
    case ServiceProvider.IFLOW:
      if (apiKey.trim()) {
        setIflowApiKey(apiKey.trim());
        saved = true;
      }
      break;
    case ServiceProvider.HUNYUAN:
      if (apiKey.trim()) {
        setHunyuanApiKey(apiKey.trim());
        saved = true;
      }
      break;
    case ServiceProvider.YOUCHAT:
      if (apiKey.trim()) {
        setYouChatApiKey(apiKey.trim());
        saved = true;
      }
      break;
    case ServiceProvider.LONGCHAT:
      if (apiKey.trim()) {
        setLongchatApiKey(apiKey.trim());
        saved = true;
      }
      break;
    case ServiceProvider.OLLAMA:
      // Ollama本地服务不需要API密钥，跳过设置
      saved = true;
      break;
    default:
      break;
  }

  // 如果保存成功，初始化对应的服务
  if (saved) {
    await initializeService(provider);
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
    case ServiceProvider.OPENAI:
      setOpenAiApiKey('');
      break;
    case ServiceProvider.DOUBAO:
      setDoubaoApiKey('');
      break;
    case ServiceProvider.OPENROUTER:
      setOpenRouterApiKey('');
      break;
    case ServiceProvider.MOONSHOT:
      setMoonshotApiKey('');
      break;
    case ServiceProvider.IFLOW:
      setIflowApiKey('');
      break;
    case ServiceProvider.HUNYUAN:
      clearHunyuanApiKey();
      break;
    case ServiceProvider.YOUCHAT:
      clearYouChatApiKey();
      break;
    case ServiceProvider.LONGCHAT:
      clearLongchatApiKey();
      break;
    case ServiceProvider.OLLAMA:
      // Ollama本地服务不需要清除API密钥
      break;
    default:
      break;
  }
};

// 验证API密钥是否有效
export const validateCredentials = (provider: ServiceProvider, apiKey: string, apiSecret?: string): boolean => {
  if (provider === ServiceProvider.XUNFEI) {
    return apiKey.length > 0 && (apiSecret?.length || 0) > 0;
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
    case ServiceProvider.MOONSHOT:
      return 'https://platform.moonshot.cn/console/api-keys';
    case ServiceProvider.IFLOW:
      return 'https://platform.iflow.cn/profile?tab=apiKey';
    case ServiceProvider.HUNYUAN:
      return 'https://cloud.tencent.com/product/hunyuan';
    case ServiceProvider.YOUCHAT:
      return 'https://you.com/platform/api-keys';
    case ServiceProvider.LONGCHAT:
      return 'https://longcat.chat/platform/api_keys';
    case ServiceProvider.OLLAMA:
      return 'http://localhost:11434';
    default:
      return '#';
  }
};

import { providerNamesConfig } from './providerNamesConfig';

// 获取服务提供商的显示名称
export const getProviderDisplayName = (provider: ServiceProvider, language: 'zh' | 'en' = 'zh'): string => {
  return providerNamesConfig[provider]?.[language] || provider;
};