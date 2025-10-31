# @qcgm1978/llm-core

LLM服务提供商核心功能库，支持多种大语言模型服务的统一管理和调用。

## 功能特点

- 统一管理多种LLM服务提供商的API配置
- 支持OpenAI、Google Gemini、DeepSeek、Groq、OpenRouter等多个服务
- 提供浏览器和Node.js双环境支持
- 简洁易用的API接口
- TypeScript类型支持

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

### Node.js环境

```javascript
// ESM导入
import { providerNamesConfig } from '@qcgm1978/llm-core';

// 或CommonJS导入
const { providerNamesConfig } = require('@qcgm1978/llm-core');

// 获取所有可用的服务提供商名称
console.log(Object.keys(providerNamesConfig));
```

### 浏览器环境

在浏览器中引入后，可通过全局变量`llmCore`访问所有功能：

```javascript
// 检查全局变量是否存在
if (typeof llmCore !== 'undefined') {
  // 获取所有可用的服务提供商名称
  console.log(Object.keys(llmCore.providerNamesConfig));
}
```

## API 文档

### 核心导出

- **providerNamesConfig**: 包含所有支持的服务提供商配置的对象
- **initServices**: 初始化LLM服务的函数
- **initAllServices**: 初始化所有LLM服务的函数
- **llmService**: LLM服务的核心类
- **providerManager**: 服务提供商管理器

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

## 版本历史

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