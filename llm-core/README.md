# llm-core

LLM Core 是一个用于 LLM 服务提供商的核心功能模块，提供统一的 API 接口和服务管理功能。

## 功能特点

- 支持多种 LLM 服务提供商（OpenAI、Gemini、DeepSeek、Groq、YouChat、讯飞等）
- 统一的流式响应接口
- 提示词管理和格式化
- 思维导图生成功能
- API 密钥管理

## 安装

```bash
npm install llm-core
# 或使用 cnpm
cnpm install llm-core
```

## 核心依赖

- `@google/generative-ai` (^0.16.0) - 可选，用于 Gemini 服务

## 使用示例

### 基础使用

```typescript
import { ServiceProvider, getSelectedServiceProvider, setSelectedServiceProvider } from 'llm-core';

// 获取当前选定的服务提供商
const currentProvider = getSelectedServiceProvider();

// 设置服务提供商
setSelectedServiceProvider(ServiceProvider.GEMINI);
```

### API 密钥管理

```typescript
import { hasApiKey, setGeminiApiKey, setOpenAiApiKey, clearAllApiKeys } from 'llm-core';

// 检查是否有可用的 API 密钥
if (!hasApiKey()) {
  // 设置 API 密钥
  setGeminiApiKey('your-gemini-api-key');
  setOpenAiApiKey('your-openai-api-key');
}

// 清除所有 API 密钥
// clearAllApiKeys();
```

### 生成定义或回答

```typescript
import { streamDefinition } from 'llm-core';

// 流式获取定义或回答
async function getDefinition() {
  const topic = '人工智能';
  const language = 'zh';
  const category = '计算机科学';
  
  for await (const chunk of streamDefinition(topic, language, category)) {
    console.log(chunk);
    // 在实际应用中，这里可以更新 UI 显示
  }
}

// 带上下文的查询
async function getAnswerWithContext() {
  const topic = '什么是机器学习？';
  const language = 'zh';
  const context = '机器学习是人工智能的一个分支，让计算机能够从数据中学习并做出预测。';
  
  for await (const chunk of streamDefinition(topic, language, undefined, context)) {
    console.log(chunk);
  }
}
```

### 生成思维导图

```typescript
import { streamMindMap, streamMindMapArrows } from 'llm-core';

// 生成思维导图数据
async function generateMindMap() {
  const content = '人工智能（Artificial Intelligence，简称AI）是计算机科学的一个分支，旨在创造能够模拟人类智能的机器。人工智能的研究领域包括机器学习、自然语言处理、计算机视觉、机器人学等。';
  
  let mindMapData = '';
  for await (const chunk of streamMindMap(content, 'zh')) {
    mindMapData += chunk;
  }
  
  console.log('思维导图数据:', mindMapData);
  
  // 基于思维导图数据生成箭头连接
  let arrowsData = '';
  for await (const chunk of streamMindMapArrows(mindMapData, 'zh')) {
    arrowsData += chunk;
  }
  
  console.log('箭头连接数据:', arrowsData);
}
```

### 提示词管理

```typescript
import { generatePrompt, getPromptByName, formatPrompt } from 'llm-core';

// 使用内置函数生成提示词
const prompt = generatePrompt('人工智能', 'zh', '计算机科学');
console.log('生成的提示词:', prompt);

// 直接获取特定提示词模板
const wikiPrompt = getPromptByName('wiki', 'zh');
console.log('Wiki 提示词模板:', wikiPrompt);

// 格式化自定义提示词模板
const customPrompt = formatPrompt('请解释什么是{topic}？', { topic: '大语言模型' });
console.log('格式化后的提示词:', customPrompt);
```

### 服务提供商注册（高级用法）

```typescript
import { ServiceProvider, registerServiceProvider } from 'llm-core';

// 注册自定义服务提供商实现
registerServiceProvider(ServiceProvider.GEMINI, {
  streamDefinition: async function* (topic, language, category, context) {
    // 自定义实现
    // ...
    yield '自定义响应内容...';
  }
});
```

## API 接口

### ServiceProvider 枚举

定义支持的 LLM 服务提供商：
- OPENAI
- GEMINI
- DEEPSEEK
- GROQ
- YOUCHAT
- XUNFEI

### 服务提供商选择与管理

- `getSelectedServiceProvider(): ServiceProvider` - 获取当前选定的服务提供商
- `setSelectedServiceProvider(provider: ServiceProvider): void` - 设置服务提供商
- `hasApiKey(): boolean` - 检查是否有可用的 API 密钥
- `registerServiceProvider(provider: ServiceProvider, implementation: ServiceProviderImplementation): void` - 注册服务提供商实现

### API 密钥管理

- `hasDeepSeekApiKey(): boolean` - 检查是否有 DeepSeek API 密钥
- `setDeepSeekApiKey(key: string): void` - 设置 DeepSeek API 密钥
- `hasGeminiApiKey(): boolean` - 检查是否有 Gemini API 密钥
- `setGeminiApiKey(key: string): void` - 设置 Gemini API 密钥
- `hasOpenAiApiKey(): boolean` - 检查是否有 OpenAI API 密钥
- `setOpenAiApiKey(key: string): void` - 设置 OpenAI API 密钥
- `hasGroqApiKey(): boolean` - 检查是否有 Groq API 密钥
- `setGroqApiKey(key: string): void` - 设置 Groq API 密钥
- `hasYouChatApiKey(): boolean` - 检查是否有 YouChat API 密钥
- `setYouChatApiKey(key: string): void` - 设置 YouChat API 密钥
- `hasXunfeiApiKey(): boolean` - 检查是否有讯飞 API 密钥
- `setXunfeiApiKey(key: string): void` - 设置讯飞 API 密钥
- `hasXunfeiApiSecret(): boolean` - 检查是否有讯飞 API 密钥 secret
- `setXunfeiApiSecret(secret: string): void` - 设置讯飞 API 密钥 secret
- `clearAllApiKeys(): void` - 清除所有 API 密钥

### 内容生成

- `streamDefinition(topic: string, language?: 'zh' | 'en', category?: string, context?: string): AsyncGenerator<string, void, undefined>` - 流式获取定义或回答
- `streamMindMap(content: string, language?: 'zh' | 'en'): AsyncGenerator<string, void, undefined>` - 流式生成思维导图数据
- `streamMindMapArrows(mindMapData: string, language?: 'zh' | 'en'): AsyncGenerator<string, void, undefined>` - 流式生成思维导图箭头连接数据

### 提示词管理

- `generatePrompt(topic: string, language?: 'zh' | 'en', category?: string, context?: string): string` - 生成提示词
- `getPromptByName(name: string, language: string): string | undefined` - 根据名称和语言获取提示词
- `formatPrompt(template: string, variables: Record<string, string>): string` - 格式化提示词模板

## 构建

```bash
# 在 llm-core 目录下
cnpm install
cnpm run build
```

构建后的文件将输出到 `dist` 目录。