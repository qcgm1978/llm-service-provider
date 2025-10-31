import * as llmCore from '../llm-core/src';
import { getPromptByName, formatPrompt, getPromptsByLanguage, updatePrompt, resetPrompts } from './prompts';

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
  setDeepSeekApiKey,
  setGeminiApiKey,
  setGroqApiKey,
  setOpenAiApiKey,
  setDoubaoApiKey
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
  yield* llmCore.streamDefinition(topic, language, category, context, promptConfig);
}

// 包装llm-core的streamMindMap函数，传递promptConfig
export async function* streamMindMap(
  content: string,
  language: "zh" | "en" = "zh"
): AsyncGenerator<string, void, undefined> {
  yield* llmCore.streamMindMap(content, language, promptConfig);
}

// 包装llm-core的streamMindMapArrows函数，传递promptConfig
export async function* streamMindMapArrows(
  mindMapData: string,
  language: "zh" | "en" = "zh"
): AsyncGenerator<string, void, undefined> {
  yield* llmCore.streamMindMapArrows(mindMapData, language, promptConfig);
}

// 包装llm-core的generatePrompt函数，传递promptConfig
export const generatePrompt = (
  topic: string,
  language: "zh" | "en" = "zh",
  category?: string,
  context?: string
): string => {
  return llmCore.generatePrompt(topic, language, category, context, promptConfig);
};

// 默认导出一个不直接引用ApiKeyManager的对象
export default {
  streamDefinition,
  hasApiKey,
  streamMindMap,
  streamMindMapArrows,
  generatePrompt,
  getPromptByName,
  formatPrompt,
  getPromptsByLanguage,
  updatePrompt,
  resetPrompts
};

// 导出prompts相关函数
export { getPromptByName, formatPrompt, getPromptsByLanguage, updatePrompt, resetPrompts, getChapterMindMapPrompt, getMindMapArrowPrompt } from './prompts';