import * as llmServiceProvider from './src';

// 导出所有从src/index.ts导出的内容
export * from './src';

// 重新导出ApiKeyManager和MindMapVisualizer
import { ApiKeyManager, MindMapVisualizer } from './src';
export { ApiKeyManager, MindMapVisualizer };

// 默认导出一个不直接引用ApiKeyManager的对象
export default {
  streamDefinition: llmServiceProvider.streamDefinition,
  hasApiKey: llmServiceProvider.hasApiKey,
  getChapterMindMapPrompt: llmServiceProvider.getChapterMindMapPrompt,
  getMindMapArrowPrompt: llmServiceProvider.getMindMapArrowPrompt,

};