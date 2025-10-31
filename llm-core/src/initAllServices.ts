// 简化的服务初始化函数
import { ServiceProvider } from './llmService';

export async function initAllServices(): Promise<void> {
  try {
    // 由于使用静态导入，不再需要动态注册服务
    // 所有服务的streamDefinition已在llmService.ts中直接导入使用
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}