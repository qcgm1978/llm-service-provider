import { ServiceProvider, registerServiceProvider } from '@qcgm1978/llm-core';

const initServices = async () => {
  try {
    const deepseekService = await import('./deepseekService');
    registerServiceProvider(ServiceProvider.DEEPSEEK, {
      streamDefinition: deepseekService.streamDefinition
    });

    const openaiService = await import('./openaiService');
    registerServiceProvider(ServiceProvider.OPENAI, {
      streamDefinition: openaiService.streamDefinition
    });

    const geminiService = await import('./geminiService');
    registerServiceProvider(ServiceProvider.GEMINI, {
      streamDefinition: geminiService.streamDefinition
    });

    const groqService = await import('./groqService');
    registerServiceProvider(ServiceProvider.GROQ, {
      streamDefinition: groqService.streamDefinition
    });

    const youChatService = await import('./youChatService');
    registerServiceProvider(ServiceProvider.YOUCHAT, {
      streamDefinition: youChatService.streamDefinition
    });

    const xunfeiService = await import('./xunfeiService');
    registerServiceProvider(ServiceProvider.XUNFEI, {
      streamDefinition: xunfeiService.streamDefinition
    });
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
};

export default initServices;