import * as llmCore from '@qcgm1978/llm-core';
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
  getMindMapArrowPrompt
} = llmCore;

export const init = initServices;

export { setHasShownApiKeyPrompt } from './llmService';

export { default as ApiKeyManager } from './ApiKeyManager';
export { default as MindMapVisualizer } from './MindMapVisualizer';