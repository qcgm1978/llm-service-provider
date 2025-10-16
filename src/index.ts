import * as llmCore from '../llm-core/src/index';
import initServices from './initServices';

initServices();

export const {
  ServiceProvider,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  hasApiKey,
  streamDefinition,
  streamMindMap,
  streamMindMapArrows,
  generatePrompt,
  getPromptByName,
  formatPrompt,
  getPromptsByLanguage,
  updatePrompt,
  resetPrompts,
  getChapterMindMapPrompt,
  getMindMapArrowPrompt,
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  hasGroqApiKey,
  hasOpenAiApiKey,
  hasDoubaoApiKey,
  setDeepSeekApiKey,
  setGeminiApiKey,
  setGroqApiKey,
  setOpenAiApiKey,
  setDoubaoApiKey,
  getAllServiceConfigurations
} = llmCore;

export const init = initServices;

export { setHasShownApiKeyPrompt } from '../llm-core/src/index';

export { default as ApiKeyManager } from './ApiKeyManager';
export { updateSelectedPromptType } from './ApiKeyManager';
export { default as MindMapVisualizer } from './MindMapVisualizer';