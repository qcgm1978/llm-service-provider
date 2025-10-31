# @qcgm1978/llm-core

Core functionality library for LLM service providers, supporting unified management and calling of multiple large language model services.

## Features

- Unified management of API configurations for multiple LLM service providers
- Support for OpenAI, Google Gemini, DeepSeek, Groq, OpenRouter and other services
- Dual environment support for browser and Node.js
- Simple and easy-to-use API interface
- TypeScript type support

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

### Node.js Environment

```javascript
// ESM import
import { providerNamesConfig } from '@qcgm1978/llm-core';

// Or CommonJS import
const { providerNamesConfig } = require('@qcgm1978/llm-core');

// Get all available service provider names
console.log(Object.keys(providerNamesConfig));
```

### Browser Environment

After importing in the browser, all functionality can be accessed through the global variable `llmCore`:

```javascript
// Check if global variable exists
if (typeof llmCore !== 'undefined') {
  // Get all available service provider names
  console.log(Object.keys(llmCore.providerNamesConfig));
}
```

## API Documentation

### Core Exports

- **providerNamesConfig**: Object containing configurations for all supported service providers
- **initServices**: Function to initialize LLM services
- **initAllServices**: Function to initialize all LLM services
- **llmService**: Core class for LLM services
- **providerManager**: Service provider manager

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

## Version History

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