// 添加缺少的导入语句
import { getChapterMindMapPrompt, getMindMapArrowPrompt } from "./mindmap";
import { getItem, setItem, removeItem } from "./utils";
// 静态导入所有服务模块
import { streamDefinition as deepseekStreamDefinition } from "./deepseekService";
import { streamDefinition as openaiStreamDefinition } from "./openaiService";
import { streamDefinition as geminiStreamDefinition, updateApiKey as updateGeminiApiKey } from "./geminiService";
import { streamDefinition as groqStreamDefinition } from "./groqService";
import { streamDefinition as youChatStreamDefinition } from "./youChatService";
import { streamDefinition as xunfeiStreamDefinition } from "./xunfeiService";
import { streamDefinition as doubaoStreamDefinition } from "./doubaoService";
import { streamDefinition as openrouterStreamDefinition } from "./openrouterService";
import { streamDefinition as moonshotStreamDefinition } from "./moonshotService";
import { streamDefinition as iflowStreamDefinition } from "./iflowService";
import { streamDefinition as hunyuanStreamDefinition } from "./hunyuanService";

// 添加心流模型服务
export enum ServiceProvider {
  DEEPSEEK = "deepseek",
  GEMINI = "gemini",
  XUNFEI = "xunfei",
  YOUCHAT = "youchat",
  GROQ = "groq",
  OPENAI = "openai",
  DOUBAO = "doubao",
  OPENROUTER = "openrouter",
  MOONSHOT = "moonshot",
  IFLOW = "iflow",
  HUNYUAN = "hunyuan",
}

export interface ServiceConfiguration {
  provider: ServiceProvider;
  name: string;
  apiKey: string;
  apiSecret: string;
  isValid: boolean;
}

// 在getSelectedServiceProvider函数中添加OPENROUTER的检查
export const getSelectedServiceProvider = (): ServiceProvider => {
  const saved = getItem("selected_service_provider");
  if (
    saved &&
    Object.values(ServiceProvider).includes(saved as ServiceProvider)
  ) {
    return saved as ServiceProvider;
  }

  if (hasDeepSeekApiKey()) {
    return ServiceProvider.DEEPSEEK;
  } else if (hasOpenAiApiKey()) {
    return ServiceProvider.OPENAI;
  } else if (hasGeminiApiKey()) {
    return ServiceProvider.GEMINI;
  } else if (hasGroqApiKey()) {
    return ServiceProvider.GROQ;
  } else if (hasYouChatApiKey()) {
    return ServiceProvider.YOUCHAT;
  } else if (hasDoubaoApiKey()) {
    return ServiceProvider.DOUBAO;
  } else if (hasOpenRouterApiKey()) {
    return ServiceProvider.OPENROUTER;
  } else if (hasMoonshotApiKey()) {
    return ServiceProvider.MOONSHOT;
  } else if (hasIflowApiKey()) {
    return ServiceProvider.IFLOW;
  } else if (hasHunyuanApiKey()) {
    return ServiceProvider.HUNYUAN;
  } else {
    return ServiceProvider.XUNFEI;
  }
};

// 添加OpenRouter的API密钥管理函数
export const hasOpenRouterApiKey = (): boolean => {
  const key = getItem("OPENROUTER_API_KEY");
  return !!key && key.trim().length > 0;
};

export const setOpenRouterApiKey = (key: string): void => {
  if (key) {
    setItem("OPENROUTER_API_KEY", key);
  } else {
    removeItem("OPENROUTER_API_KEY");
  }
};

// 添加Moonshot的API密钥管理函数
export const hasMoonshotApiKey = (): boolean => {
  const key = getItem("MOONSHOT_API_KEY");
  return !!key && key.trim().length > 0;
};

export const setMoonshotApiKey = (key: string): void => {
  if (key) {
    setItem("MOONSHOT_API_KEY", key);
  } else {
    removeItem("MOONSHOT_API_KEY");
  }
};

// 更新hasApiKey函数，添加hasOpenRouterApiKey检查
export const hasApiKey = (): boolean => {
  return (
    hasDeepSeekApiKey() ||
    hasGeminiApiKey() ||
    hasGroqApiKey() ||
    hasYouChatApiKey() ||
    hasFreeApiKey() ||
    hasOpenAiApiKey() ||
    hasDoubaoApiKey() ||
    hasOpenRouterApiKey() ||
    hasMoonshotApiKey() ||
    hasHunyuanApiKey()
  );
};

// 获取所有服务提供商的配置数据
export const getAllServiceConfigurations = (): ServiceConfiguration[] => {
  const configurations: ServiceConfiguration[] = [];
  
  // 服务名称映射
  const serviceNames: Record<ServiceProvider, string> = {
    [ServiceProvider.DEEPSEEK]: 'DeepSeek',
    [ServiceProvider.GEMINI]: 'Gemini',
    [ServiceProvider.XUNFEI]: '讯飞',
    [ServiceProvider.YOUCHAT]: 'YouChat',
    [ServiceProvider.GROQ]: 'Groq',
    [ServiceProvider.OPENAI]: 'OpenAI',
    [ServiceProvider.DOUBAO]: '豆包',
    [ServiceProvider.OPENROUTER]: 'OpenRouter',
    [ServiceProvider.MOONSHOT]: 'Moonshot',
    [ServiceProvider.IFLOW]: '心流',
    [ServiceProvider.HUNYUAN]: '混元',
  };
  
  // 遍历所有服务提供商
  Object.values(ServiceProvider).forEach((provider) => {
    const config: ServiceConfiguration = {
      provider,
      name: serviceNames[provider],
      apiKey: '',
      apiSecret: '',
      isValid: false
    };
    
    // 根据服务提供商类型获取相应的配置
    switch (provider) {
      case ServiceProvider.DEEPSEEK:
        config.apiKey = getItem('DEEPSEEK_API_KEY') || '';
        config.isValid = hasDeepSeekApiKey();
        break;
      case ServiceProvider.GEMINI:
        config.apiKey = getItem('GEMINI_API_KEY') || '';
        config.isValid = hasGeminiApiKey();
        break;
      case ServiceProvider.GROQ:
        config.apiKey = getItem('GROQ_API_KEY') || '';
        config.isValid = hasGroqApiKey();
        break;
      case ServiceProvider.XUNFEI:
        config.apiKey = getItem('XUNFEI_API_KEY') || '';
        config.apiSecret = getItem('XUNFEI_API_SECRET') || '';
        config.isValid = hasXunfeiApiKey() && hasXunfeiApiSecret();
        break;
      case ServiceProvider.OPENAI:
        config.apiKey = getItem('OPENAI_API_KEY') || '';
        config.isValid = hasOpenAiApiKey();
        break;
      case ServiceProvider.DOUBAO:
        config.apiKey = getItem('DOUBAO_API_KEY') || '';
        config.isValid = hasDoubaoApiKey();
        break;
      case ServiceProvider.OPENROUTER:
        config.apiKey = getItem('OPENROUTER_API_KEY') || '';
        config.isValid = hasOpenRouterApiKey();
        break;
      case ServiceProvider.MOONSHOT:
        config.apiKey = getItem('MOONSHOT_API_KEY') || '';
        config.isValid = hasMoonshotApiKey();
        break;
      case ServiceProvider.IFLOW:
        config.apiKey = getItem('IFLOW_API_KEY') || '';
        config.isValid = hasIflowApiKey();
        break;
      case ServiceProvider.HUNYUAN:
        config.apiKey = getItem('HUNYUAN_API_KEY') || '';
        config.isValid = hasHunyuanApiKey();
        break;
      case ServiceProvider.YOUCHAT:
        config.apiKey = getItem('YOUCHAT_API_KEY') || '';
        config.isValid = hasYouChatApiKey();
        break;
    }
    
    configurations.push(config);
  });
  
  return configurations;
};

export const setSelectedServiceProvider = (provider: ServiceProvider): void => {
  setItem("selected_service_provider", provider);
};

export const hasDeepSeekApiKey = (): boolean => {
  const key = getItem("DEEPSEEK_API_KEY");
  return !!key && key.trim().length > 0;
};

export const hasGeminiApiKey = (): boolean => {
  const key = getItem("GEMINI_API_KEY");
  return !!key && key.trim().length > 0;
};

export const hasIflowApiKey = (): boolean => {
  const key = getItem("IFLOW_API_KEY");
  return !!key && key.trim().length > 0;
};

export const hasFreeApiKey = (): boolean => {
  return hasXunfeiApiKey() && hasXunfeiApiSecret();
};

export const setDeepSeekApiKey = (key: string): void => {
  if (key) {
    setItem("DEEPSEEK_API_KEY", key);
  } else {
    removeItem("DEEPSEEK_API_KEY");
  }
};

export const setIflowApiKey = (key: string): void => {
  if (key) {
    setItem("IFLOW_API_KEY", key);
  } else {
    removeItem("IFLOW_API_KEY");
  }
};

export interface ServiceProviderImplementation {
  streamDefinition: (
    topic: string,
    language: "zh" | "en",
    category?: string,
    context?: string,
    allowChatField?: boolean
  ) => AsyncGenerator<string, void, undefined>;
}

// 提示模板相关接口
export interface Prompt {
  act: string;
  prompt: string;
}

export interface PromptConfig {
  getPromptByName?: (name?: string, language?: string) => string | undefined;
  formatPrompt?: (prompt: string, replacements: Record<string, string>) => string;
}


export const setGeminiApiKey = (key: string): void => {
  if (key) {
    setItem("GEMINI_API_KEY", key);
    // 直接调用更新函数
    updateGeminiApiKey(key);
  } else {
    removeItem("GEMINI_API_KEY");
  }
};

// 添加清理文本的辅助函数
function cleanContent(content: string): string {
  // 删除连续的#字符
  let cleaned = content.replace(/#{2,}/g, "");
  // 删除连续的*字符
  cleaned = cleaned.replace(/\*{2,}/g, "");
  // 检查并移除重复的句子模式（针对混元模型返回的重复内容）
  // 使用正则表达式检测重复的句子或段落
  cleaned = cleaned.replace(/([^.!。！?？\n]{20,}([.!。！?？]|\n))\1+/g, '$1');
  return cleaned;
}

export async function* streamDefinition(
  topic: string,
  language: "zh" | "en" = "zh",
  category?: string,
  context?: string,
  promptConfig?: PromptConfig
): AsyncGenerator<string, void, undefined> {
  const provider = getSelectedServiceProvider();
  try {
    let implementationStream: AsyncGenerator<string, void, undefined>;
    
    // 首先检查是否有指定服务的API密钥，如果没有则使用默认的youchat
    switch (provider) {
      case ServiceProvider.DEEPSEEK:
        implementationStream = hasDeepSeekApiKey() ? 
          deepseekStreamDefinition(topic, language, category, context) : 
          youChatStreamDefinition(topic, language, category, context);
        break;
      case ServiceProvider.OPENAI:
        implementationStream = hasOpenAiApiKey() ? 
          openaiStreamDefinition(topic, language, category, context) : 
          youChatStreamDefinition(topic, language, category, context);
        break;
      case ServiceProvider.GEMINI:
        implementationStream = hasGeminiApiKey() ? 
          geminiStreamDefinition(topic, language, category, context) : 
          youChatStreamDefinition(topic, language, category, context);
        break;
      case ServiceProvider.GROQ:
        implementationStream = hasGroqApiKey() ? 
          groqStreamDefinition(topic, language, category, context) : 
          youChatStreamDefinition(topic, language, category, context);
        break;
      case ServiceProvider.YOUCHAT:
        implementationStream = youChatStreamDefinition(topic, language, category, context);
        break;
      case ServiceProvider.DOUBAO:
        implementationStream = hasDoubaoApiKey() ? 
          doubaoStreamDefinition(topic, language, category, context) : 
          youChatStreamDefinition(topic, language, category, context);
        break;
      case ServiceProvider.OPENROUTER:
        implementationStream = hasOpenRouterApiKey() ? 
          openrouterStreamDefinition(topic, language, category, context) : 
          youChatStreamDefinition(topic, language, category, context);
        break;
      case ServiceProvider.MOONSHOT:
        implementationStream = hasMoonshotApiKey() ? 
          moonshotStreamDefinition(topic, language, category, context) : 
          youChatStreamDefinition(topic, language, category, context);
        break;
      case ServiceProvider.IFLOW:
        implementationStream = hasIflowApiKey() ? 
          iflowStreamDefinition(topic, language, category, context) : 
          youChatStreamDefinition(topic, language, category, context);
        break;
      case ServiceProvider.HUNYUAN:
        implementationStream = hasHunyuanApiKey() ? 
          hunyuanStreamDefinition(topic, language, category, context) : 
          youChatStreamDefinition(topic, language, category, context);
        break;
      default:
        implementationStream = youChatStreamDefinition(topic, language, category, context);
    }

    // 遍历实现的流，应用清理函数
    for await (const chunk of implementationStream) {
      yield cleanContent(chunk);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const prefix = language === "zh" ? "发生错误: " : "Error: ";
    throw new Error(`${prefix}${errorMessage}`);
  }
}

export const hasGroqApiKey = (): boolean => {
  const key = getItem("GROQ_API_KEY");
  return !!key && key.trim().length > 0;
};

export const setGroqApiKey = (key: string): void => {
  if (key) {
    setItem("GROQ_API_KEY", key);
  } else {
    removeItem("GROQ_API_KEY");
  }
};

export const clearAllApiKeys = (): void => {
  localStorage.removeItem("DEEPSEEK_API_KEY");
  localStorage.removeItem("GEMINI_API_KEY");
  localStorage.removeItem("GROQ_API_KEY");
  localStorage.removeItem("OPENAI_API_KEY");
  localStorage.removeItem("DOUBAO_API_KEY");
  localStorage.removeItem("OPENROUTER_API_KEY");
  localStorage.removeItem("MOONSHOT_API_KEY");
  localStorage.removeItem("HUNYUAN_API_KEY");
};

export const generatePrompt = (
  topic: string,
  language: "zh" | "en" = "zh",
  category?: string,
  context?: string,
  promptConfig?: PromptConfig
): string => {
  // 使用传入的promptConfig或创建默认实现
  const getPromptByNameFn = promptConfig?.getPromptByName || ((name?: string) => {
    // 默认提示模板作为后备
    const defaultTemplates: Record<string, Record<string, string>> = {
      zh: {
        '带上下文回答': '{topic}\n\n上下文信息：{context}',
        'wiki': '{topic}',
        '简洁定义': '{topic}'
      },
      en: {
        'Answer with Context': '{topic}\n\nContext information: {context}',
        'Category Definition': '{topic}',
        'Concise Definition': '{topic}'
      }
    };
    return defaultTemplates[language]?.[name || ''] || '{topic}';
  });
  
  const formatPromptFn = promptConfig?.formatPrompt || ((prompt: string, replacements: Record<string, string>) => {
    let result = prompt;
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    }
    return result.replace('{category}的', '');
  });

  let promptTemplate: string | undefined;

  // 首先检查是否有用户手动选择的模板类型
  const selectedTemplate = typeof window !== 'undefined' && window.localStorage ? 
    localStorage.getItem("SELECTED_PROMPT_TEMPLATE") : undefined;

  if (selectedTemplate) {
    // 如果有用户选择的模板，优先使用
    promptTemplate = getPromptByNameFn(selectedTemplate, language);

    // 特殊处理wiki模板，当category为空时使用简化版本
    if (selectedTemplate === "wiki" && !category && language === "zh") {
      promptTemplate =
        '请用中文为"{topic}"提供一个简洁、百科全书式的定义。请提供信息丰富且中立的内容。不要使用markdown、标题或任何特殊格式。只返回定义本身的文本。';
    }
  }

  // 如果没有用户选择的模板或者找不到该模板，则按原来的逻辑选择模板
  if (!promptTemplate) {
    if (language === "zh") {
      if (context) {
        promptTemplate = getPromptByNameFn("带上下文回答", language);
      } else if (category) {
        promptTemplate = getPromptByNameFn("wiki", language);
      } else {
        promptTemplate = getPromptByNameFn("简洁定义", language);
      }
    } else {
      if (context) {
        promptTemplate = getPromptByNameFn("Answer with Context", language);
      } else if (category) {
        promptTemplate = getPromptByNameFn("Category Definition", language);
      } else {
        promptTemplate = getPromptByNameFn("Concise Definition", language);
      }
    }
  }

  // 如果找不到模板，使用默认实现
  if (!promptTemplate) {
    // 保留原来的默认实现作为后备
    if (language === "zh") {
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

  return formatPromptFn(promptTemplate, replacements);
};

export const hasXunfeiApiKey = (): boolean => {
  const key = getItem("XUNFEI_API_KEY");
  return !!key && key.trim().length > 0;
};

export const hasXunfeiApiSecret = (): boolean => {
  const secret = getItem("XUNFEI_API_SECRET");
  return !!secret && secret.trim().length > 0;
};

export const setXunfeiApiKey = (key: string): void => {
  if (key) {
    setItem("XUNFEI_API_KEY", key);
  } else {
    removeItem("XUNFEI_API_KEY");
  }
};

export const setXunfeiApiSecret = (secret: string): void => {
  if (secret) {
    setItem("XUNFEI_API_SECRET", secret);
  } else {
    removeItem("XUNFEI_API_SECRET");
  }
};

export const hasShownApiKeyPrompt = (): boolean => {
  const shown = localStorage.getItem("has_shown_api_key_prompt");
  return shown === "true";
};

export const setHasShownApiKeyPrompt = (shown: boolean): void => {
  localStorage.setItem("has_shown_api_key_prompt", shown.toString());
};

export const hasYouChatApiKey = (): boolean => {
  const key = getItem("YOUCHAT_API_KEY");
  return !!key && key.trim().length > 0;
};

export const setYouChatApiKey = (key: string): void => {
  if (key) {
    setItem("YOUCHAT_API_KEY", key);
  } else {
    removeItem("YOUCHAT_API_KEY");
  }
};

export const hasOpenAiApiKey = (): boolean => {
  const key = getItem("OPENAI_API_KEY");
  return !!key && key.trim().length > 0;
};

export const setOpenAiApiKey = (key: string): void => {
  if (key) {
    setItem("OPENAI_API_KEY", key);
  } else {
    removeItem("OPENAI_API_KEY");
  }
};

// 思维导图生成函数
export async function* streamMindMap(
  content: string,
  language: "zh" | "en" = "zh",
  promptConfig?: PromptConfig
): AsyncGenerator<string, void, undefined> {
  const prompt = getChapterMindMapPrompt();

  try {
    // 将内容和思维导图提示结合
    const fullPrompt = `${content}\n\n${prompt}`;

    yield* streamDefinition(fullPrompt, language, "mindmap", undefined, promptConfig);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const prefix =
      language === "zh"
        ? "生成思维导图时发生错误: "
        : "Error generating mind map: ";
    yield `${prefix}${errorMessage}`;
  }
}

// 思维导图箭头生成函数
export async function* streamMindMapArrows(
  mindMapData: string,
  language: "zh" | "en" = "zh",
  promptConfig?: PromptConfig
): AsyncGenerator<string, void, undefined> {
  const prompt = getMindMapArrowPrompt();

  try {
    // 将思维导图数据和箭头提示结合
    const fullPrompt = `${mindMapData}\n\n${prompt}`;

    // 使用streamDefinition函数来生成箭头，但更改category以区分
    yield* streamDefinition(fullPrompt, language, "mindmap_arrows", undefined, promptConfig);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const prefix =
      language === "zh"
        ? "生成思维导图箭头时发生错误: "
        : "Error generating mind map arrows: ";
    yield `${prefix}${errorMessage}`;
  }
}

// 添加 hasDoubaoApiKey 函数
export const hasDoubaoApiKey = (): boolean => {
  const key = getItem("DOUBAO_API_KEY");
  return !!key && key.trim().length > 0;
};

// 添加 setDoubaoApiKey 函数
export const setDoubaoApiKey = (key: string): void => {
  if (key) {
    setItem("DOUBAO_API_KEY", key);
  } else {
    removeItem("DOUBAO_API_KEY");
  }
};

// 添加 hasHunyuanApiKey 函数
export const hasHunyuanApiKey = (): boolean => {
  const key = getItem("HUNYUAN_API_KEY");
  return !!key && key.trim().length > 0;
};

// 添加 setHunyuanApiKey 函数
export const setHunyuanApiKey = (key: string): void => {
  if (key) {
    setItem("HUNYUAN_API_KEY", key);
  } else {
    removeItem("HUNYUAN_API_KEY");
  }
};

// 在文件顶部添加模型常量
const OPENROUTER_MODELS = {
  'openai/gpt-4o': 'OpenAI GPT-4o',
  'qwen/qwen3-coder:free': 'Qwen3 Coder (Free)',
  'openai/gpt-oss-20b:free': 'OpenAI GPT-OSS-20B (Free)'
};

// 获取默认模型
const getDefaultOpenRouterModel = (): string => 'openai/gpt-oss-20b:free';

// 在已有函数后添加以下函数
// 获取用户选择的OpenRouter模型
export const getSelectedModel = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedModel = localStorage.getItem('OPENROUTER_SELECTED_MODEL');
    if (savedModel && Object.keys(OPENROUTER_MODELS).includes(savedModel)) {
      return savedModel;
    }
  }
  return getDefaultOpenRouterModel();
};

// 设置用户选择的OpenRouter模型
export const setSelectedModel = (model: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('OPENROUTER_SELECTED_MODEL', model);
  }
};

// 获取所有可用的OpenRouter模型
export const getAvailableModels = (): Record<string, string> => {
  return OPENROUTER_MODELS;
};
