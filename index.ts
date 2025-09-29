import { streamDefinition, hasApiKey, setHasShownApiKeyPrompt } from './src/llmService'
import ApiKeyManager from './src/ApiKeyManager'
import { 
  getChapterMindMapPrompt,
  getMindMapArrowPrompt,
  streamMindMap,
  streamMindMapArrows
} from './src'

export {
  streamDefinition,
  hasApiKey,
  setHasShownApiKeyPrompt,
  ApiKeyManager,
  getChapterMindMapPrompt,
  getMindMapArrowPrompt,
  streamMindMap,
  streamMindMapArrows
}

export default {
  streamDefinition,
  hasApiKey,
  ApiKeyManager,
  getChapterMindMapPrompt,
  getMindMapArrowPrompt,
  streamMindMap,
  streamMindMapArrows
}

export { default as ApiKeyManager } from './src/ApiKeyManager'
export { default as styles } from './src/index.module.css'