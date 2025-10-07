// 添加缺少的导入语句
import { getPromptByName, formatPrompt } from './prompts';
import { getChapterMindMapPrompt, getMindMapArrowPrompt } from './mindmap';

export enum ServiceProvider {
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini',
  XUNFEI = 'xunfei',
  YOUCHAT = 'youchat',
  GROQ = 'groq',
  OPENAI = 'openai',
  DOUBAO = 'doubao'
}

export const getSelectedServiceProvider = (): ServiceProvider => {
  const saved = localStorage.getItem('selected_service_provider')
  if (
    saved &&
    Object.values(ServiceProvider).includes(saved as ServiceProvider)
  ) {
    return saved as ServiceProvider
  }

  if (hasDeepSeekApiKey()) {
    return ServiceProvider.DEEPSEEK
  } else if (hasOpenAiApiKey()) {
    return ServiceProvider.OPENAI
  } else if (hasGeminiApiKey()) {
    return ServiceProvider.GEMINI
  } else if (hasGroqApiKey()) {
    return ServiceProvider.GROQ
  } else if (hasYouChatApiKey()) {
    return ServiceProvider.YOUCHAT
  } else if (hasDoubaoApiKey()) {
    return ServiceProvider.DOUBAO
  } else {
    return ServiceProvider.XUNFEI
  }
}

export const setSelectedServiceProvider = (provider: ServiceProvider): void => {
  localStorage.setItem('selected_service_provider', provider)
}

export const hasDeepSeekApiKey = (): boolean => {
  const key = localStorage.getItem('DEEPSEEK_API_KEY')
  return !!key && key.trim().length > 0
}

export const hasGeminiApiKey = (): boolean => {
  const key = localStorage.getItem('GEMINI_API_KEY')
  return !!key && key.trim().length > 0
}

export const hasFreeApiKey = (): boolean => {
  return hasXunfeiApiKey() && hasXunfeiApiSecret()
}

export const setDeepSeekApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('DEEPSEEK_API_KEY', key)
  } else {
    localStorage.removeItem('DEEPSEEK_API_KEY')
  }
}

export interface ServiceProviderImplementation {
  streamDefinition: (topic: string, language: 'zh' | 'en', category?: string, context?: string, allowChatField?: boolean) => AsyncGenerator<string, void, undefined>;
}

export const serviceProvidersRegistry: Record<ServiceProvider, ServiceProviderImplementation | null> = {
  [ServiceProvider.DEEPSEEK]: null,
  [ServiceProvider.GEMINI]: null,
  [ServiceProvider.XUNFEI]: null,
  [ServiceProvider.YOUCHAT]: null,
  [ServiceProvider.GROQ]: null,
  [ServiceProvider.OPENAI]: null,
  [ServiceProvider.DOUBAO]: null
};

export const registerServiceProvider = (provider: ServiceProvider, implementation: ServiceProviderImplementation) => {
  serviceProvidersRegistry[provider] = implementation;
};

export const setGeminiApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('GEMINI_API_KEY', key)
    
    // 更新 Gemini API 密钥
    try {
      // 动态导入以避免循环依赖
      import('./geminiService').then(({ updateApiKey }) => {
        updateApiKey(key)
      })
    } catch (e) {
      console.error('Failed to update Gemini API key:', e)
    }
  } else {
    localStorage.removeItem('GEMINI_API_KEY')
  }
};

// 添加清理文本的辅助函数
function cleanContent(content: string): string {
  // 删除连续的#字符
  let cleaned = content.replace(/#{2,}/g, '')
  // 删除连续的*字符
  cleaned = cleaned.replace(/\*{2,}/g, '')
  return cleaned
}

export async function* streamDefinition(
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string,
  allowChatField: boolean = false
): AsyncGenerator<string, void, undefined> {
  const provider = getSelectedServiceProvider()
  const implementation = serviceProvidersRegistry[provider];
  
  try {
    let implementationStream: AsyncGenerator<string, void, undefined>;
    
    if (implementation) {
      implementationStream = implementation.streamDefinition(topic, language, category, context);
    } else {
      switch (provider) {
        case ServiceProvider.DEEPSEEK:
          if (hasDeepSeekApiKey()) {
            const { streamDefinition } = await import('./deepseekService')
            implementationStream = streamDefinition(topic, language, category, context)
            break
          }
        case ServiceProvider.OPENAI:
          if (hasOpenAiApiKey()) {
            const { streamDefinition } = await import('./openaiService')
            implementationStream = streamDefinition(topic, language, category, context)
            break
          }
        case ServiceProvider.GEMINI:
          if (hasGeminiApiKey()) {
            const { streamDefinition } = await import('./geminiService')
            implementationStream = streamDefinition(topic, language, category, context)
            break
          }
        case ServiceProvider.GROQ:
          if (hasGroqApiKey()) {
            const { streamDefinition } = await import('./groqService')
            implementationStream = streamDefinition(topic, language, category, context)
            break
          }
        case ServiceProvider.YOUCHAT:
          if (hasYouChatApiKey()) {
            const { streamDefinition } = await import('./youChatService')
            // 我们需要修改 youChatService.ts 来接受这个参数
            implementationStream = streamDefinition(topic, language, category, context)
            break
          }
        case ServiceProvider.XUNFEI:
          if (hasFreeApiKey()) {
            const { streamDefinition } = await import('./xunfeiService')
            implementationStream = streamDefinition(topic, language, category, context)
            break
          }
        case ServiceProvider.DOUBAO:
          if (hasDoubaoApiKey()) {
            const { streamDefinition } = await import('./doubaoService')
            implementationStream = streamDefinition(topic, language, category, context)
            break
          }
        default:
          const { streamDefinition } = await import('./xunfeiService')
          implementationStream = streamDefinition(topic, language, category, context)
      }
    }
    
    // 遍历实现的流，应用清理函数
    for await (const chunk of implementationStream) {
      yield cleanContent(chunk)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    const prefix = language === 'zh' ? '发生错误: ' : 'Error: '
    yield `${prefix}${errorMessage}`
  }
}

export const hasGroqApiKey = (): boolean => {
  const key = localStorage.getItem('GROQ_API_KEY')
  return !!key && key.trim().length > 0
}

export const setGroqApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('GROQ_API_KEY', key)
  } else {
    localStorage.removeItem('GROQ_API_KEY')
  }
}

export const clearAllApiKeys = (): void => {
  localStorage.removeItem('DEEPSEEK_API_KEY')
  localStorage.removeItem('GEMINI_API_KEY')
  localStorage.removeItem('GROQ_API_KEY')
  localStorage.removeItem('OPENAI_API_KEY')
  localStorage.removeItem('DOUBAO_API_KEY')
}

export const generatePrompt = (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): string => {
  let promptTemplate: string | undefined;
  
  // 首先检查是否有用户手动选择的模板类型
  const selectedTemplate = localStorage.getItem('SELECTED_PROMPT_TEMPLATE');
  
  if (selectedTemplate) {
    // 如果有用户选择的模板，优先使用
    promptTemplate = getPromptByName(selectedTemplate, language);
    
    // 特殊处理wiki模板，当category为空时使用简化版本
    if (selectedTemplate === 'wiki' && !category && language === 'zh') {
      promptTemplate = '请用中文为"{topic}"提供一个简洁、百科全书式的定义。请提供信息丰富且中立的内容。不要使用markdown、标题或任何特殊格式。只返回定义本身的文本。';
    }
  }
  
  // 如果没有用户选择的模板或者找不到该模板，则按原来的逻辑选择模板
  if (!promptTemplate) {
    if (language === 'zh') {
      if (context) {
        promptTemplate = getPromptByName('带上下文回答', 'zh');
      } else if (category) {
        promptTemplate = getPromptByName('wiki', 'zh');
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
  const key = localStorage.getItem('XUNFEI_API_KEY')
  return !!key && key.trim().length > 0
}

export const hasXunfeiApiSecret = (): boolean => {
  const secret = localStorage.getItem('XUNFEI_API_SECRET')
  return !!secret && secret.trim().length > 0
}

export const setXunfeiApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('XUNFEI_API_KEY', key)
  } else {
    localStorage.removeItem('XUNFEI_API_KEY')
  }
}

export const setXunfeiApiSecret = (secret: string): void => {
  if (secret) {
    localStorage.setItem('XUNFEI_API_SECRET', secret)
  } else {
    localStorage.removeItem('XUNFEI_API_SECRET')
  }
}

export const hasShownApiKeyPrompt = (): boolean => {
  const shown = localStorage.getItem('has_shown_api_key_prompt')
  return shown === 'true'
}

export const setHasShownApiKeyPrompt = (shown: boolean): void => {
  localStorage.setItem('has_shown_api_key_prompt', shown.toString())
}

export const hasYouChatApiKey = (): boolean => {
  return true
}

export const setYouChatApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('YOUCHAT_API_KEY', key)
  } else {
    localStorage.removeItem('YOUCHAT_API_KEY')
  }
}

export const hasOpenAiApiKey = (): boolean => {
  const key = localStorage.getItem('OPENAI_API_KEY')
  return !!key && key.trim().length > 0
}

export const setOpenAiApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('OPENAI_API_KEY', key)
  } else {
    localStorage.removeItem('OPENAI_API_KEY')
  }
}

export const hasApiKey = (): boolean => {
  return (
    hasDeepSeekApiKey() ||
    hasGeminiApiKey() ||
    hasGroqApiKey() ||
    hasYouChatApiKey() ||
    hasFreeApiKey() ||
    hasOpenAiApiKey() ||
    hasDoubaoApiKey()
  )
}

// 思维导图生成函数
export async function* streamMindMap(
  content: string,
  language: 'zh' | 'en' = 'zh'
): AsyncGenerator<string, void, undefined> {
  const prompt = getChapterMindMapPrompt()
  
  try {
    // 将内容和思维导图提示结合
    const fullPrompt = `${content}\n\n${prompt}`
    
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

// 添加 hasDoubaoApiKey 函数
export const hasDoubaoApiKey = (): boolean => {
  const key = localStorage.getItem('DOUBAO_API_KEY')
  return !!key && key.trim().length > 0
}

// 添加 setDoubaoApiKey 函数
export const setDoubaoApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('DOUBAO_API_KEY', key)
  } else {
    localStorage.removeItem('DOUBAO_API_KEY')
  }
}