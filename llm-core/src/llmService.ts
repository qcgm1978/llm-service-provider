// 添加缺少的导入语句

import { getItem, setItem, removeItem } from "./utils";
// 静态导入所有服务模块
import { streamDefinition as deepseekStreamDefinition } from "./deepseekService";
import { streamDefinition as openaiStreamDefinition } from "./openaiService";
import {
  streamDefinition as geminiStreamDefinition,
  updateApiKey as updateGeminiApiKey,
} from "./geminiService";
import { streamDefinition as groqStreamDefinition } from "./groqService";
import { streamDefinition as youChatStreamDefinition } from "./youChatService";
import { streamDefinition as xunfeiStreamDefinition } from "./xunfeiService";
import { 
  streamDefinition as doubaoStreamDefinition,
  chat as doubaoChat,
  streamChat as doubaoStreamChat,
  setModel as setDoubaoModel
} from "./doubaoService";
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
    hasHunyuanApiKey() ||
    (hasXunfeiApiKey() && hasXunfeiApiSecret())
  );
};

// 获取所有服务提供商的配置数据
export const getAllServiceConfigurations = (): ServiceConfiguration[] => {
  const configurations: ServiceConfiguration[] = [];

  // 服务名称映射
  const serviceNames: Record<ServiceProvider, string> = {
    [ServiceProvider.DEEPSEEK]: "DeepSeek",
    [ServiceProvider.GEMINI]: "Gemini",
    [ServiceProvider.XUNFEI]: "讯飞",
    [ServiceProvider.YOUCHAT]: "YouChat",
    [ServiceProvider.GROQ]: "Groq",
    [ServiceProvider.OPENAI]: "OpenAI",
    [ServiceProvider.DOUBAO]: "豆包",
    [ServiceProvider.OPENROUTER]: "OpenRouter",
    [ServiceProvider.MOONSHOT]: "Moonshot",
    [ServiceProvider.IFLOW]: "心流",
    [ServiceProvider.HUNYUAN]: "混元",
  };

  // 遍历所有服务提供商
  Object.values(ServiceProvider).forEach((provider) => {
    const config: ServiceConfiguration = {
      provider,
      name: serviceNames[provider],
      apiKey: "",
      apiSecret: "",
      isValid: false,
    };

    // 根据服务提供商类型获取相应的配置
    switch (provider) {
      case ServiceProvider.DEEPSEEK:
        config.apiKey = getItem("DEEPSEEK_API_KEY") || "";
        config.isValid = hasDeepSeekApiKey();
        break;
      case ServiceProvider.GEMINI:
        config.apiKey = getItem("GEMINI_API_KEY") || "";
        config.isValid = hasGeminiApiKey();
        break;
      case ServiceProvider.GROQ:
        config.apiKey = getItem("GROQ_API_KEY") || "";
        config.isValid = hasGroqApiKey();
        break;
      case ServiceProvider.XUNFEI:
        config.apiKey = getItem("XUNFEI_API_KEY") || "";
        config.apiSecret = getItem("XUNFEI_API_SECRET") || "";
        config.isValid = hasXunfeiApiKey() && hasXunfeiApiSecret();
        break;
      case ServiceProvider.OPENAI:
        config.apiKey = getItem("OPENAI_API_KEY") || "";
        config.isValid = hasOpenAiApiKey();
        break;
      case ServiceProvider.DOUBAO:
        config.apiKey = getItem("DOUBAO_API_KEY") || "";
        config.isValid = hasDoubaoApiKey();
        break;
      case ServiceProvider.OPENROUTER:
        config.apiKey = getItem("OPENROUTER_API_KEY") || "";
        config.isValid = hasOpenRouterApiKey();
        break;
      case ServiceProvider.MOONSHOT:
        config.apiKey = getItem("MOONSHOT_API_KEY") || "";
        config.isValid = hasMoonshotApiKey();
        break;
      case ServiceProvider.IFLOW:
        config.apiKey = getItem("IFLOW_API_KEY") || "";
        config.isValid = hasIflowApiKey();
        break;
      case ServiceProvider.HUNYUAN:
        config.apiKey = getItem("HUNYUAN_API_KEY") || "";
        config.isValid = hasHunyuanApiKey();
        break;
      case ServiceProvider.YOUCHAT:
        config.apiKey = getItem("YOUCHAT_API_KEY") || "";
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
  formatPrompt?: (
    prompt: string,
    replacements: Record<string, string>
  ) => string;
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
  cleaned = cleaned.replace(/([^.!。！?？\n]{20,}([.!。！?？]|\n))\1+/g, "$1");
  return cleaned;
}

export async function* streamDefinition(
  topic: string,
  language: "zh" | "en" = "zh",
  context?: string
): AsyncGenerator<string, void, undefined> {
  const provider = getSelectedServiceProvider();
  try {
    let implementationStream: AsyncGenerator<string, void, undefined>;

    // 首先检查是否有指定服务的API密钥，如果没有则使用默认的youchat
    switch (provider) {
      case ServiceProvider.DEEPSEEK:
        implementationStream = hasDeepSeekApiKey()
          ? deepseekStreamDefinition(topic, language, context)
          : youChatStreamDefinition(topic, language, context);
        break;
      case ServiceProvider.OPENAI:
        implementationStream = hasOpenAiApiKey()
          ? openaiStreamDefinition(topic, language, context)
          : youChatStreamDefinition(topic, language, context);
        break;
      case ServiceProvider.GEMINI:
        implementationStream = hasGeminiApiKey()
          ? geminiStreamDefinition(topic, language, context)
          : youChatStreamDefinition(topic, language, context);
        break;
      case ServiceProvider.GROQ:
        implementationStream = hasGroqApiKey()
          ? groqStreamDefinition(topic, language, context)
          : youChatStreamDefinition(topic, language, context);
        break;
      case ServiceProvider.YOUCHAT:
        implementationStream = youChatStreamDefinition(
          topic,
          language,
          context
        );
        break;
      case ServiceProvider.DOUBAO:
        implementationStream = hasDoubaoApiKey()
          ? doubaoStreamDefinition(topic, language, context)
          : youChatStreamDefinition(topic, language, context);
        break;
      case ServiceProvider.OPENROUTER:
        implementationStream = hasOpenRouterApiKey()
          ? openrouterStreamDefinition(topic, language, context)
          : youChatStreamDefinition(topic, language, context);
        break;
      case ServiceProvider.MOONSHOT:
        implementationStream = hasMoonshotApiKey()
          ? moonshotStreamDefinition(topic, language, context)
          : youChatStreamDefinition(topic, language, context);
        break;
      case ServiceProvider.IFLOW:
        implementationStream = hasIflowApiKey()
          ? iflowStreamDefinition(topic, language, context)
          : youChatStreamDefinition(topic, language, context);
        break;
      case ServiceProvider.HUNYUAN:
        implementationStream = hasHunyuanApiKey()
          ? hunyuanStreamDefinition(topic, language, context)
          : youChatStreamDefinition(topic, language, context);
        break;
      case ServiceProvider.XUNFEI:
        implementationStream = (hasXunfeiApiKey() && hasXunfeiApiSecret())
          ? xunfeiStreamDefinition(topic, language, context)
          : youChatStreamDefinition(topic, language, context);
        break;
      default:
        implementationStream = youChatStreamDefinition(
          topic,
          language,
          context
        );
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
  context?: string
): string => {
  // 简化的提示生成逻辑
  if (context) {
    topic =
      language === "zh"
        ? `${topic}\n\n上下文信息：${context}`
        : `${topic}\n\nContext information: ${context}`;
  }
  return language === "zh" ? `${topic}\n\n使用中文` : `${topic}\n\nby English`;
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
  "openai/gpt-4o": "OpenAI GPT-4o",
  "qwen/qwen3-coder:free": "Qwen3 Coder (Free)",
  "openai/gpt-oss-20b:free": "OpenAI GPT-OSS-20B (Free)",
};

// 获取默认模型
const getDefaultOpenRouterModel = (): string => "openai/gpt-oss-20b:free";

// 在已有函数后添加以下函数
// 获取用户选择的OpenRouter模型
export const getSelectedModel = (): string => {
  if (typeof window !== "undefined" && window.localStorage) {
    const savedModel = localStorage.getItem("OPENROUTER_SELECTED_MODEL");
    if (savedModel && Object.keys(OPENROUTER_MODELS).includes(savedModel)) {
      return savedModel;
    }
  }
  return getDefaultOpenRouterModel();
};

// 设置用户选择的OpenRouter模型
export const setSelectedModel = (model: string): void => {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("OPENROUTER_SELECTED_MODEL", model);
  }
};

// 获取所有可用的OpenRouter模型
export const getAvailableModels = (): Record<string, string> => {
  return OPENROUTER_MODELS;
};

// 创建llmService对象，包含所有函数
export const llmService = {
  // 获取选择的服务提供商
  getSelectedServiceProvider: getSelectedServiceProvider,
  
  // 设置选择的服务提供商
  setSelectedServiceProvider: setSelectedServiceProvider,
  
  // 聊天函数
  chat: async (prompt: string): Promise<string> => {
    const provider = getSelectedServiceProvider();
    
    switch (provider) {
      case ServiceProvider.DOUBAO:
        if (hasDoubaoApiKey()) {
          return doubaoChat(prompt);
        } else {
          return "豆包服务未配置API Key";
        }
      default:
        // 对于其他服务，这里可以添加相应的实现
        return "该服务的聊天功能暂未实现";
    }
  },

  // 流式聊天函数
  streamChat: async function* (prompt: string): AsyncGenerator<string, void, undefined> {
    const provider = getSelectedServiceProvider();
    
    switch (provider) {
      case ServiceProvider.DOUBAO:
        if (hasDoubaoApiKey()) {
          const stream = doubaoStreamChat(prompt);
          for await (const chunk of stream) {
            yield cleanContent(chunk);
          }
        } else {
          yield "豆包服务未配置API Key";
        }
        break;
      default:
        // 对于其他服务，这里可以添加相应的实现
        yield "该服务的流式聊天功能暂未实现";
    }
  },

  // 处理流的辅助函数
  handleStream: async (
    stream: AsyncGenerator<string, void, undefined>,
    callbacks: {
      onChunk: (chunk: string) => void;
      onComplete: () => void;
    }
  ): Promise<void> => {
    let fullContent = '';
    for await (const chunk of stream) {
      fullContent += chunk;
      callbacks.onChunk(fullContent);
    }
    callbacks.onComplete();
  },

  // 添加setDoubaoModel到服务对象
  setDoubaoModel,
  
  // 添加hasDoubaoApiKey方法
  hasDoubaoApiKey: hasDoubaoApiKey,
  
  // 添加setDoubaoApiKey方法
  setDoubaoApiKey: setDoubaoApiKey
};

// 为了兼容，同时保留单独的导出
export const chat = llmService.chat;
export const streamChat = llmService.streamChat;
export const handleStream = llmService.handleStream;
