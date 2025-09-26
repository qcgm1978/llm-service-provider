import { getPromptByName, formatPrompt } from './prompts';
import { getChapterMindMapPrompt, getMindMapArrowPrompt } from './mindmap';

export enum ServiceProvider {
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini',
  XUNFEI = 'xunfei',
  YOUCHAT = 'youchat',
  GROQ = 'groq'
}

// 检查运行环境是否支持 localStorage
const hasLocalStorage = () => {
  try {
    return typeof window !== 'undefined' && !!window.localStorage
  } catch (e) {
    return false
  }
}

export const getSelectedServiceProvider = (): ServiceProvider => {
  if (hasLocalStorage()) {
    const saved = localStorage.getItem('selected_service_provider')
    if (
      saved &&
      Object.values(ServiceProvider).includes(saved as ServiceProvider)
    ) {
      return saved as ServiceProvider
    }
  }

  if (hasDeepSeekApiKey()) {
    return ServiceProvider.DEEPSEEK
  } else if (hasGeminiApiKey()) {
    return ServiceProvider.GEMINI
  } else if (hasGroqApiKey()) {
    return ServiceProvider.GROQ
  } else if (hasYouChatApiKey()) {
    return ServiceProvider.YOUCHAT
  } else {
    return ServiceProvider.XUNFEI
  }
}

export const setSelectedServiceProvider = (provider: ServiceProvider): void => {
  if (hasLocalStorage()) {
    localStorage.setItem('selected_service_provider', provider)
  }
}

export const hasDeepSeekApiKey = (): boolean => {
  if (hasLocalStorage()) {
    const key = localStorage.getItem('DEEPSEEK_API_KEY')
    return !!key && key.trim().length > 0
  }
  return false
}

export const hasGeminiApiKey = (): boolean => {
  if (hasLocalStorage()) {
    const key = localStorage.getItem('GEMINI_API_KEY')
    return !!key && key.trim().length > 0
  }
  return false
}

export const hasFreeApiKey = (): boolean => {
  return hasXunfeiApiKey() && hasXunfeiApiSecret()
}

export const setDeepSeekApiKey = (key: string): void => {
  if (hasLocalStorage()) {
    if (key) {
      localStorage.setItem('DEEPSEEK_API_KEY', key)
    } else {
      localStorage.removeItem('DEEPSEEK_API_KEY')
    }
  }
}

export const setGeminiApiKey = (key: string): void => {
  if (hasLocalStorage()) {
    if (key) {
      localStorage.setItem('GEMINI_API_KEY', key)
      
      // 更新 Gemini API 密钥
      if (typeof window !== 'undefined') {
        try {
          // 动态导入以避免循环依赖
          import('./geminiService').then(({ updateApiKey }) => {
            updateApiKey(key)
          })
        } catch (e) {
          console.error('Failed to update Gemini API key:', e)
        }
      }
    } else {
      localStorage.removeItem('GEMINI_API_KEY')
      
      if (typeof window !== 'undefined') {
        try {
          import('./geminiService').then(({ updateApiKey }) => {
            updateApiKey(null)
          })
        } catch (e) {
          console.error('Failed to clear Gemini API key:', e)
        }
      }
    }
  }
}

export const hasGroqApiKey = (): boolean => {
  if (hasLocalStorage()) {
    const key = localStorage.getItem('GROQ_API_KEY')
    return !!key && key.trim().length > 0
  }
  return false
}

export const setGroqApiKey = (key: string): void => {
  if (hasLocalStorage()) {
    if (key) {
      localStorage.setItem('GROQ_API_KEY', key)
    } else {
      localStorage.removeItem('GROQ_API_KEY')
    }
  }
}

export const clearAllApiKeys = (): void => {
  if (hasLocalStorage()) {
    localStorage.removeItem('DEEPSEEK_API_KEY')
    localStorage.removeItem('GEMINI_API_KEY')
    localStorage.removeItem('GROQ_API_KEY')
  }
}

export const generatePrompt = (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): string => {
  let promptTemplate: string | undefined;
  
  if (language === 'zh') {
    if (context) {
      promptTemplate = getPromptByName('带上下文回答', 'zh');
    } else if (category) {
      promptTemplate = getPromptByName('类别定义', 'zh');
    } else {
      promptTemplate = getPromptByName('简洁定义', 'zh');
    }
  } else {
    if (context) {
      promptTemplate = getPromptByName('Answer with Context', 'en');
    } else if (category) {
      promptTemplate = getPromptByName('Category Definition', 'en');
    } else {
      promptTemplate = getPromptByName('Concise Definition', 'en');
    }
  }
  
  // 如果找不到模板，使用默认实现
  if (!promptTemplate) {
    // 保留原来的默认实现作为后备
    if (language === 'zh') {
      if (context) {
        return `${topic}\n\n${context}`;
      } else if (category) {
        return `${topic}`;
      } else {
        return `${topic}`;
      }
    } else {
      if (context) {
        return `${topic}\n\n${context}`;
      } else if (category) {
        return `${topic}`;
      } else {
        return `${topic}`;
      }
    }
  }
  
  // 替换提示模板中的变量
  const replacements: Record<string, string> = { topic };
  if (category) replacements.category = category;
  if (context) replacements.context = context;
  
  return formatPrompt(promptTemplate, replacements);
};

export const hasXunfeiApiKey = (): boolean => {
  if (hasLocalStorage()) {
    const key = localStorage.getItem('XUNFEI_API_KEY')
    return !!key && key.trim().length > 0
  }
  return false
}

export const hasXunfeiApiSecret = (): boolean => {
  if (hasLocalStorage()) {
    const secret = localStorage.getItem('XUNFEI_API_SECRET')
    return !!secret && secret.trim().length > 0
  }
  return false
}

export const setXunfeiApiKey = (key: string): void => {
  if (hasLocalStorage()) {
    if (key) {
      localStorage.setItem('XUNFEI_API_KEY', key)
    } else {
      localStorage.removeItem('XUNFEI_API_KEY')
    }
  }
}

export const setXunfeiApiSecret = (secret: string): void => {
  if (hasLocalStorage()) {
    if (secret) {
      localStorage.setItem('XUNFEI_API_SECRET', secret)
    } else {
      localStorage.removeItem('XUNFEI_API_SECRET')
    }
  }
}

export const hasShownApiKeyPrompt = (): boolean => {
  if (hasLocalStorage()) {
    const shown = localStorage.getItem('has_shown_api_key_prompt')
    return shown === 'true'
  }
  return false
}

export const setHasShownApiKeyPrompt = (shown: boolean): void => {
  if (hasLocalStorage()) {
    localStorage.setItem('has_shown_api_key_prompt', shown.toString())
  }
}

export const hasYouChatApiKey = (): boolean => {
  return true
}

export const setYouChatApiKey = (key: string): void => {
  if (hasLocalStorage()) {
    if (key) {
      localStorage.setItem('YOUCHAT_API_KEY', key)
    } else {
      localStorage.removeItem('YOUCHAT_API_KEY')
    }
  }
}

export const hasApiKey = (): boolean => {
  return (
    hasDeepSeekApiKey() ||
    hasGeminiApiKey() ||
    hasGroqApiKey() ||
    hasYouChatApiKey() ||
    hasFreeApiKey()
  )
}

// 动态导入服务模块以处理流定义
// 注意：为了避免循环依赖，我们使用动态导入

export async function* streamDefinition(
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const provider = getSelectedServiceProvider()
  
  try {
    switch (provider) {
      case ServiceProvider.DEEPSEEK:
        if (hasDeepSeekApiKey()) {
          const { streamDefinition } = await import('./deepseekService')
          yield* streamDefinition(topic, language, category, context)
          break
        }
      case ServiceProvider.GEMINI:
        if (hasGeminiApiKey()) {
          const { streamDefinition } = await import('./geminiService')
          yield* streamDefinition(topic, language, category, context)
          break
        }
      case ServiceProvider.GROQ:
        if (hasGroqApiKey()) {
          const { streamDefinition } = await import('./groqService')
          yield* streamDefinition(topic, language, category, context)
          break
        }
      case ServiceProvider.YOUCHAT:
        if (hasYouChatApiKey()) {
          const { streamDefinition } = await import('./youChatService')
          yield* streamDefinition(topic, language, category, context)
          break
        }
      case ServiceProvider.XUNFEI:
        if (hasFreeApiKey()) {
          const { streamDefinition } = await import('./xunfeiService')
          yield* streamDefinition(topic, language, category, context)
          break
        }
      default:
        const { streamDefinition } = await import('./xunfeiService')
        yield* streamDefinition(topic, language, category, context)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    const prefix = language === 'zh' ? '发生错误: ' : 'Error: '
    yield `${prefix}${errorMessage}`
  }
}

// 在文件末尾添加
// 思维导图生成函数
export async function* streamMindMap(
  content: string,
  language: 'zh' | 'en' = 'zh'
): AsyncGenerator<string, void, undefined> {
  const provider = getSelectedServiceProvider()
  const prompt = getChapterMindMapPrompt()
  
  try {
    // 将内容和思维导图提示结合
    const fullPrompt = `${content}\n\n${prompt}`
    
    // 使用streamDefinition函数来生成思维导图，但更改category以区分
    yield* streamDefinition(fullPrompt, language, 'mindmap')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    const prefix = language === 'zh' ? '生成思维导图时发生错误: ' : 'Error generating mind map: '
    yield `${prefix}${errorMessage}`
  }
}

// 思维导图箭头生成函数
export async function* streamMindMapArrows(
  mindMapData: string,
  language: 'zh' | 'en' = 'zh'
): AsyncGenerator<string, void, undefined> {
  const provider = getSelectedServiceProvider()
  const prompt = getMindMapArrowPrompt()
  
  try {
    // 将思维导图数据和箭头提示结合
    const fullPrompt = `${mindMapData}\n\n${prompt}`
    
    // 使用streamDefinition函数来生成箭头，但更改category以区分
    yield* streamDefinition(fullPrompt, language, 'mindmap_arrows')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    const prefix = language === 'zh' ? '生成思维导图箭头时发生错误: ' : 'Error generating mind map arrows: '
    yield `${prefix}${errorMessage}`
  }
}