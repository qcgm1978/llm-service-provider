import { ServiceProvider, registerServiceProvider } from '../llm-core/src/llmService'

/**
 * 初始化所有 LLM 服务
 */
export async function initServices(): Promise<void> {
  try {
    // 注册 DeepSeek 服务
    const { streamDefinition: deepseekStream } = await import('../llm-core/src/deepseekService');
    registerServiceProvider(ServiceProvider.DEEPSEEK, { streamDefinition: deepseekStream });
    
    // 注册 OpenAI 服务
    const { streamDefinition: openaiStream } = await import('../llm-core/src/openaiService');
    registerServiceProvider(ServiceProvider.OPENAI, { streamDefinition: openaiStream });
    
    // 注册 Gemini 服务
    const { streamDefinition: geminiStream } = await import('../llm-core/src/geminiService');
    registerServiceProvider(ServiceProvider.GEMINI, { streamDefinition: geminiStream });
    
    // 注册 Groq 服务
    const { streamDefinition: groqStream } = await import('../llm-core/src/groqService');
    registerServiceProvider(ServiceProvider.GROQ, { streamDefinition: groqStream });
    
    // 注册 YouChat 服务
    const { streamDefinition: youChatStream } = await import('../llm-core/src/youChatService');
    registerServiceProvider(ServiceProvider.YOUCHAT, { streamDefinition: youChatStream });
    
    // 注册 讯飞 服务
    const { streamDefinition: xunfeiStream } = await import('../llm-core/src/xunfeiService');
    registerServiceProvider(ServiceProvider.XUNFEI, { streamDefinition: xunfeiStream });
    
    // 注册豆包服务
    const { streamDefinition: doubaoStream } = await import('../llm-core/src/doubaoService');
    registerServiceProvider(ServiceProvider.DOUBAO, { streamDefinition: doubaoStream });
    
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}

export default initServices;