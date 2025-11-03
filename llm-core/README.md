# @qcgm1978/llm-core

LLM服务提供商核心功能库，支持多种大语言模型服务的统一管理和调用。

## 功能特点

- 统一管理多种LLM服务提供商的API配置
- 支持OpenAI、Google Gemini、DeepSeek、Groq、OpenRouter等多个服务
- 提供浏览器和Node.js双环境支持
- 简洁易用的API接口
- TypeScript类型支持
- 流式响应和定义生成支持

## 安装

### NPM/Yarn安装

```bash
npm install @qcgm1978/llm-core
# 或
yarn add @qcgm1978/llm-core
# 或
cnpm install @qcgm1978/llm-core
```

### 浏览器直接引入

使用CDN服务直接在HTML中引入：

```html
<!-- 使用unpkg CDN -->
<script src="https://unpkg.com/@qcgm1978/llm-core@latest/dist/browser.js"></script>

<!-- 或使用jsdelivr CDN -->
<script src="https://cdn.jsdelivr.net/npm/@qcgm1978/llm-core@latest/dist/browser.js"></script>
```

## 使用方法

### 1. Node.js环境基本使用

```javascript
// ESM导入
import { initServices, llmService, providerNamesConfig } from '@qcgm1978/llm-core';

// 初始化特定服务
const apiKeys = {
  openai: 'your-openai-api-key',
  gemini: 'your-gemini-api-key'
};

// 初始化服务
initServices(apiKeys);

// 或者初始化所有服务（如果有所有API密钥）
// import { initAllServices } from '@qcgm1978/llm-core';
// initAllServices(apiKeys);

// 获取所有可用的服务提供商名称
console.log(Object.keys(providerNamesConfig));
```

### 2. 使用llmService进行对话

```javascript
// 设置当前使用的提供商
llmService.setCurrentProvider('openai');

// 执行简单对话
async function runChat() {
  try {
    // 同步响应
    const response = await llmService.chat('你好，介绍一下自己');
    console.log('AI响应:', response);
    
    // 流式响应
    const stream = await llmService.streamChat('请解释什么是人工智能');
    let fullResponse = '';
    
    for await (const chunk of stream) {
      fullResponse += chunk;
      console.log('流式输出:', chunk);
    }
    
    console.log('完整响应:', fullResponse);
  } catch (error) {
    console.error('对话错误:', error);
  }
}

runChat();
```

### 3. 定义生成功能

```javascript
// 生成定义
async function generateDefinition() {
  // 定义主题、语言和上下文
  const topic = '机器学习';
  const language = 'zh'; // 可选，默认为'zh'
  const context = '为初学者提供简明解释'; // 可选
  
  try {
    // 生成定义
    const definition = await llmService.generateDefinition(topic, language, context);
    console.log('生成的定义:', definition);
    
    // 流式生成定义
    const stream = await llmService.streamDefinition(topic, language, context);
    let fullDefinition = '';
    
    for await (const chunk of stream) {
      fullDefinition += chunk;
      console.log('流式定义输出:', chunk);
    }
    
    console.log('完整定义:', fullDefinition);
  } catch (error) {
    console.error('定义生成错误:', error);
  }
}

generateDefinition();
```

### 4. 浏览器环境使用

在浏览器中引入后，可通过全局变量`llmCore`访问所有功能：

```javascript
// 检查全局变量是否存在
if (typeof llmCore !== 'undefined') {
  // 初始化服务
  const apiKeys = {
    openai: document.getElementById('openai-api-key').value
  };
  
  llmCore.initServices(apiKeys);
  llmCore.llmService.setCurrentProvider('openai');
  
  // 绑定按钮点击事件
  document.getElementById('chat-button').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt-input').value;
    const responseElement = document.getElementById('response-output');
    
    try {
      // 流式响应示例
      responseElement.textContent = '';
      const stream = await llmCore.llmService.streamChat(prompt);
      
      for await (const chunk of stream) {
        responseElement.textContent += chunk;
      }
    } catch (error) {
      responseElement.textContent = '错误: ' + error.message;
    }
  });
}
```

### 5. 服务提供商管理

```javascript
// 使用providerManager管理服务
import { providerManager } from '@qcgm1978/llm-core';

// 检查特定提供商是否可用
const isOpenAIReady = providerManager.isProviderReady('openai');
console.log('OpenAI可用状态:', isOpenAIReady);

// 获取当前活跃的服务提供商
const activeProviders = providerManager.getActiveProviders();
console.log('活跃的服务提供商:', activeProviders);

// 检查API密钥是否有效格式（客户端验证）
const isValidKey = providerManager.validateApiKey('openai', 'sk-...');
console.log('API密钥格式是否有效:', isValidKey);
```

## API 文档

### 核心导出

- **providerNamesConfig**: 包含所有支持的服务提供商配置的对象
- **initServices(apiKeys)**: 初始化指定的LLM服务
  - 参数: `apiKeys`: 包含服务名称和API密钥的对象
  - 返回值: 无

- **initAllServices(apiKeys)**: 初始化所有LLM服务
  - 参数: `apiKeys`: 包含服务名称和API密钥的对象
  - 返回值: 无

- **llmService**: LLM服务的核心类，提供以下主要方法：
  - `setCurrentProvider(providerName)`: 设置当前使用的服务提供商
  - `chat(prompt)`: 发送消息并获取响应
  - `streamChat(prompt)`: 发送消息并获取流式响应
  - `generateDefinition(topic, language = 'zh', context?)`: 生成定义
  - `streamDefinition(topic, language = 'zh', context?)`: 流式生成定义

- **providerManager**: 服务提供商管理器，提供以下主要方法：
  - `isProviderReady(providerName)`: 检查特定提供商是否已初始化
  - `getActiveProviders()`: 获取所有活跃的服务提供商
  - `validateApiKey(providerName, apiKey)`: 验证API密钥格式

### 获取服务提供商配置

```javascript
// 获取所有服务提供商的配置
const allProviders = providerNamesConfig;

// 获取特定服务提供商的配置
const openaiConfig = providerNamesConfig.openai;
```

## 支持的服务提供商

- OpenAI
- Google Gemini
- DeepSeek
- Groq
- OpenRouter
- Moonshot
- YouChat
- Doubao
- Xunfei
- IFLOW

## 版本历史

- 3.6.38: 更新API文档，优化用户使用体验
- 3.6.31: 更新webpack配置，优化UMD输出
- 3.6.30: 修复浏览器兼容性问题

## 开发说明

### 构建项目

```bash
# 构建项目
npm run build

# 这将生成以下文件：
# - dist/index.js (Node.js环境)
# - dist/browser.js (浏览器环境)
# - 相关的TypeScript类型声明文件
```

### 测试浏览器环境

```bash
# 启动本地HTTP服务器
cd llm-core
python3 -m http.server 8000

# 然后访问 http://localhost:8000/simple-test.html
```

## 许可证

MIT License