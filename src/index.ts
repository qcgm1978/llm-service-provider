import * as llmCore from '../llm-core/src';
import { getPromptByName, formatPrompt, getPromptsByLanguage } from './prompts';

llmCore.initAllServices();

// 创建提示模板配置，适配llm-core的PromptConfig接口
const promptConfig = {
  getPromptByName: (name: string, language: string) => {
    const prompt = getPromptByName(language, name);
    return prompt?.prompt || '';
  },
  formatPrompt: (prompt: string, replacements: Record<string, string>) => {
    let result = prompt;
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    }
    return result.replace('{category}的', '');
  }
};

export const {
  ServiceProvider,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  hasApiKey,
  getAllServiceConfigurations,
  getProviderCredentials,
  saveProviderCredentials,
  clearProviderCredentials,
  validateCredentials,
  getProviderApiKeyLink,
  getProviderDisplayName,
  providerNamesConfig,
  initAllServices,
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  hasGroqApiKey,
  hasOpenAiApiKey,
  hasDoubaoApiKey,
  hasXunfeiApiKey,
  hasXunfeiApiSecret,
  hasHunyuanApiKey,
  hasOpenRouterApiKey,
  hasMoonshotApiKey,
  hasIflowApiKey,
  setDeepSeekApiKey,
  setGeminiApiKey,
  setGroqApiKey,
  setOpenAiApiKey,
  setDoubaoApiKey,
  setXunfeiApiKey,
  setXunfeiApiSecret,
  setHunyuanApiKey,
  setOpenRouterApiKey,
  setMoonshotApiKey,
  setIflowApiKey,
  clearAllApiKeys
} = llmCore;

export const init = initAllServices;

export { setHasShownApiKeyPrompt } from '../llm-core/src';

export { default as ApiKeyManager } from './ApiKeyManager';
export { updateSelectedPromptType } from './ApiKeyManager';
export { default as MindMapVisualizer } from './MindMapVisualizer';

// 包装llm-core的streamDefinition函数，传递promptConfig
export async function* streamDefinition(
  topic: string,
  language: "zh" | "en" = "zh",
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  yield* llmCore.streamDefinition({ topic, language, category, context });
}



// 简化的generatePrompt函数
export const generatePrompt = (
  topic: string,
  language: "zh" | "en" = "zh",
  context?: string
): string => {
  return llmCore.generatePrompt(topic, language, context);
};

// 默认导出一个不直接引用ApiKeyManager的对象
// 统一的API密钥设置函数
export const setApiKey = (provider: string, apiKey: string, apiSecret?: string): void => {
  switch (provider) {
    case ServiceProvider.DEEPSEEK:
      setDeepSeekApiKey(apiKey);
      break;
    case ServiceProvider.GEMINI:
      setGeminiApiKey(apiKey);
      break;
    case ServiceProvider.GROQ:
      setGroqApiKey(apiKey);
      break;
    case ServiceProvider.OPENAI:
      setOpenAiApiKey(apiKey);
      break;
    case ServiceProvider.DOUBAO:
      setDoubaoApiKey(apiKey);
      break;
    case ServiceProvider.XUNFEI:
      setXunfeiApiKey(apiKey);
      if (apiSecret) {
        setXunfeiApiSecret(apiSecret);
      }
      break;
    case ServiceProvider.OPENROUTER:
      setOpenRouterApiKey(apiKey);
      break;
    case ServiceProvider.MOONSHOT:
      setMoonshotApiKey(apiKey);
      break;
    case ServiceProvider.IFLOW:
      setIflowApiKey(apiKey);
      break;
    case ServiceProvider.HUNYUAN:
      setHunyuanApiKey(apiKey);
      break;
    case ServiceProvider.YOUCHAT:
      // YouChat 可能有特殊的设置逻辑，但根据现有代码，这里可能不需要操作
      break;
    default:
      break;
  }
};

export default {
  streamDefinition,
  hasApiKey,
  setApiKey,

  generatePrompt,
  getPromptByName,
  formatPrompt,
  getPromptsByLanguage,
};

// 导出prompts相关函数
export { getPromptByName, formatPrompt, getPromptsByLanguage, getChapterMindMapPrompt, getMindMapArrowPrompt } from './prompts';