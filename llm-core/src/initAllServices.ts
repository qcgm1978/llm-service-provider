// 将第一行修改为直接从llmService导入，而不是从index导入
import { ServiceProvider, registerServiceProvider } from './llmService';

export async function initAllServices(): Promise<void> {
  try {
    // 注册 DeepSeek 服务
    const { streamDefinition: deepseekStream } = await import('./deepseekService');
    registerServiceProvider(ServiceProvider.DEEPSEEK, { streamDefinition: deepseekStream });
    
    // 注册 OpenAI 服务
    const { streamDefinition: openaiStream } = await import('./openaiService');
    registerServiceProvider(ServiceProvider.OPENAI, { streamDefinition: openaiStream });
    
    // 注册 Gemini 服务
    const { streamDefinition: geminiStream } = await import('./geminiService');
    registerServiceProvider(ServiceProvider.GEMINI, { streamDefinition: geminiStream });
    
    // 注册 Groq 服务
    const { streamDefinition: groqStream } = await import('./groqService');
    registerServiceProvider(ServiceProvider.GROQ, { streamDefinition: groqStream });
    
    // 注册 YouChat 服务
    const { streamDefinition: youChatStream } = await import('./youChatService');
    registerServiceProvider(ServiceProvider.YOUCHAT, { streamDefinition: youChatStream });
    
    // 注册 讯飞 服务
    const { streamDefinition: xunfeiStream } = await import('./xunfeiService');
    registerServiceProvider(ServiceProvider.XUNFEI, { streamDefinition: xunfeiStream });
    
    // 注册豆包服务
    const { streamDefinition: doubaoStream } = await import('./doubaoService');
    registerServiceProvider(ServiceProvider.DOUBAO, { streamDefinition: doubaoStream });
    
    // 注册OpenRouter服务
    const { streamDefinition: openrouterStream } = await import('./openrouterService');
    registerServiceProvider(ServiceProvider.OPENROUTER, { streamDefinition: openrouterStream });
    
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}