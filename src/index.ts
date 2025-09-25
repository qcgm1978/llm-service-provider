// 导出核心服务
import { 
  ServiceProvider,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  hasGroqApiKey,
  hasXunfeiApiKey,
  hasXunfeiApiSecret,
  hasYouChatApiKey,
  hasApiKey,
  hasFreeApiKey,
  hasShownApiKeyPrompt,
  setDeepSeekApiKey,
  setGeminiApiKey,
  setGroqApiKey,
  setXunfeiApiKey,
  setXunfeiApiSecret,
  setYouChatApiKey,
  setHasShownApiKeyPrompt,
  clearAllApiKeys,
  streamDefinition,
  generatePrompt,
  streamMindMap,
  streamMindMapArrows
} from './llmService'

// 导出 React 组件
import ApiKeyManager from './ApiKeyManager'

// 导出所有功能
import { 
  getChapterMindMapPrompt, 
  getMindMapArrowPrompt 
} from './mindmap'

// 服务提供商和API密钥管理

export {
  ServiceProvider,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  hasApiKey,
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  hasGroqApiKey,
  hasXunfeiApiKey,
  hasXunfeiApiSecret,
  hasYouChatApiKey,
  hasFreeApiKey,
  hasShownApiKeyPrompt,
  setDeepSeekApiKey,
  setGeminiApiKey,
  setGroqApiKey,
  setXunfeiApiKey,
  setXunfeiApiSecret,
  setYouChatApiKey,
  setHasShownApiKeyPrompt,
  clearAllApiKeys
}

// 思维导图功能

export {
  getChapterMindMapPrompt,
  getMindMapArrowPrompt
}

// React 组件

export {
  ApiKeyManager
}

// 内容生成

export {
  generatePrompt,
  streamDefinition,
  streamMindMap,
  streamMindMapArrows
}