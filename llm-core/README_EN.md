# @qcgm1978/llm-core

Core functionality library for LLM service providers, supporting unified management and calling of multiple large language model services.

## Features

- Unified management of API configurations for multiple LLM service providers
- Support for OpenAI, Google Gemini, DeepSeek, Groq, OpenRouter and other services
- Dual environment support for browser and Node.js
- Simple and easy-to-use API interface
- TypeScript type support
- Streaming response and definition generation support

## Installation

### NPM/Yarn Installation

```bash
npm install @qcgm1978/llm-core
# or
yarn add @qcgm1978/llm-core
# or
cnpm install @qcgm1978/llm-core
```

### Direct Browser Import

Use CDN services to directly import in HTML:

```html
<!-- Using unpkg CDN -->
<script src="https://unpkg.com/@qcgm1978/llm-core@latest/dist/browser.js"></script>

<!-- Or using jsdelivr CDN -->
<script src="https://cdn.jsdelivr.net/npm/@qcgm1978/llm-core@latest/dist/browser.js"></script>
```

## Usage

### 1. Basic Usage in Node.js Environment

```javascript
// ESM import
import { initServices, llmService, providerNamesConfig } from '@qcgm1978/llm-core';

// Initialize specific services
const apiKeys = {
  openai: 'your-openai-api-key',
  gemini: 'your-gemini-api-key'
};

// Initialize services
initServices(apiKeys);

// Or initialize all services (if you have all API keys)
// import { initAllServices } from '@qcgm1978/llm-core';
// initAllServices(apiKeys);

// Get all available service provider names
console.log(Object.keys(providerNamesConfig));
```

### 2. Using llmService for Chat

```javascript
// Set current provider
llmService.setCurrentProvider('openai');

// Execute simple chat
async function runChat() {
  try {
    // Synchronous response
    const response = await llmService.chat('Hello, introduce yourself');
    console.log('AI response:', response);
    
    // Streaming response
    const stream = await llmService.streamChat('Explain what artificial intelligence is');
    let fullResponse = '';
    
    for await (const chunk of stream) {
      fullResponse += chunk;
      console.log('Streaming output:', chunk);
    }
    
    console.log('Complete response:', fullResponse);
  } catch (error) {
    console.error('Chat error:', error);
  }
}

runChat();
```

### 3. Definition Generation Function

```javascript
// Generate definition
async function generateDefinition() {
  // Define topic, language and context
  const topic = 'Machine Learning';
  const language = 'en'; // Optional, default is 'zh'
  const context = 'Provide a concise explanation for beginners'; // Optional
  
  try {
    // Generate definition
    const definition = await llmService.generateDefinition(topic, language, context);
    console.log('Generated definition:', definition);
    
    // Stream definition generation
    const stream = await llmService.streamDefinition(topic, language, context);
    let fullDefinition = '';
    
    for await (const chunk of stream) {
      fullDefinition += chunk;
      console.log('Streaming definition output:', chunk);
    }
    
    console.log('Complete definition:', fullDefinition);
  } catch (error) {
    console.error('Definition generation error:', error);
  }
}

generateDefinition();
```

### 4. Browser Environment Usage

After importing in the browser, all functionality can be accessed through the global variable `llmCore`:

```javascript
// Check if global variable exists
if (typeof llmCore !== 'undefined') {
  // Initialize services
  const apiKeys = {
    openai: document.getElementById('openai-api-key').value
  };
  
  llmCore.initServices(apiKeys);
  llmCore.llmService.setCurrentProvider('openai');
  
  // Bind button click event
  document.getElementById('chat-button').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt-input').value;
    const responseElement = document.getElementById('response-output');
    
    try {
      // Streaming response example
      responseElement.textContent = '';
      const stream = await llmCore.llmService.streamChat(prompt);
      
      for await (const chunk of stream) {
        responseElement.textContent += chunk;
      }
    } catch (error) {
      responseElement.textContent = 'Error: ' + error.message;
    }
  });
}
```

### 5. Service Provider Management

```javascript
// Use providerManager to manage services
import { providerManager } from '@qcgm1978/llm-core';

// Check if a specific provider is available
const isOpenAIReady = providerManager.isProviderReady('openai');
console.log('OpenAI availability status:', isOpenAIReady);

// Get currently active service providers
const activeProviders = providerManager.getActiveProviders();
console.log('Active service providers:', activeProviders);

// Check if API key has valid format (client-side validation)
const isValidKey = providerManager.validateApiKey('openai', 'sk-...');
console.log('Is API key format valid:', isValidKey);
```

## API Documentation

### Core Exports

- **providerNamesConfig**: Object containing configurations for all supported service providers
- **initServices(apiKeys)**: Function to initialize specified LLM services
  - Parameters: `apiKeys`: Object containing service names and API keys
  - Return value: None

- **initAllServices(apiKeys)**: Function to initialize all LLM services
  - Parameters: `apiKeys`: Object containing service names and API keys
  - Return value: None

- **llmService**: Core class for LLM services, providing the following main methods:
  - `setCurrentProvider(providerName)`: Set the currently used service provider
  - `chat(prompt)`: Send a message and get a response
  - `streamChat(prompt)`: Send a message and get a streaming response
  - `generateDefinition(topic, language = 'zh', context?)`: Generate definition
  - `streamDefinition(topic, language = 'zh', context?)`: Stream definition generation

- **providerManager**: Service provider manager, providing the following main methods:
  - `isProviderReady(providerName)`: Check if a specific provider is initialized
  - `getActiveProviders()`: Get all active service providers
  - `validateApiKey(providerName, apiKey)`: Validate API key format

### Get Service Provider Configuration

```javascript
// Get configurations for all service providers
const allProviders = providerNamesConfig;

// Get configuration for a specific service provider
const openaiConfig = providerNamesConfig.openai;
```

## Supported Service Providers

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

## Version History

- 3.6.38: Updated API documentation, optimized user experience
- 3.6.31: Updated webpack configuration, optimized UMD output
- 3.6.30: Fixed browser compatibility issues

## Development Notes

### Build Project

```bash
# Build the project
npm run build

# This will generate the following files:
# - dist/index.js (Node.js environment)
# - dist/browser.js (Browser environment)
# - Related TypeScript declaration files
```

### Test Browser Environment

```bash
# Start local HTTP server
cd llm-core
python3 -m http.server 8000

# Then visit http://localhost:8000/simple-test.html
```

## License

MIT License