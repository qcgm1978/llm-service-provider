import * as llmCore from '../llm-core';
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
  setDoubaoApiKey
} = llmCore;

export const init = initServices;

export { setHasShownApiKeyPrompt } from '../llm-core';

export { default as ApiKeyManager } from './ApiKeyManager';
export { default as MindMapVisualizer } from './MindMapVisualizer';