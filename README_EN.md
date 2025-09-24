# LLM Service Provider

A Node.js module that integrates multiple LLM (Large Language Model) services, supporting DeepSeek, Gemini, Groq, Xunfei Xinghuo, and YouChat service providers.

Example: [Revelation](https://github.com/qcgm1978/revelation)

## Installation

```bash
npm install llm-service-provider
# or
pnpm add llm-service-provider
# or
 yarn add llm-service-provider
```

## Usage

### 1. Using API Key Management Component

```tsx
import React, { useState } from 'react'
import { ApiKeyManager } from 'llm-service-provider'

function App() {
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const handleSaveApiKey = (key: string) => {
    setApiKey(key)
    console.log('API key saved:', key)
  }

  return (
    <div>
      <button onClick={() => setIsApiKeyManagerOpen(true)}>
        Configure API Key
      </button>
      
      <ApiKeyManager
        isOpen={isApiKeyManagerOpen}
        onSave={handleSaveApiKey}
        onClose={() => setIsApiKeyManagerOpen(false)}
      />
    </div>
  )
}

export default App
```

### 2. Using Streaming Content Generation

```tsx
import React, { useState, useEffect, useRef } from 'react'
import { streamDefinition, getSelectedServiceProvider, hasApiKey } from 'llm-service-provider'

function ContentGenerator({ topic }: { topic: string }) {
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!topic || !hasApiKey()) return

    const generateContent = async () => {
      setIsGenerating(true)
      setContent('')
      controllerRef.current = new AbortController()
      const signal = controllerRef.current.signal

      try {
        const provider = getSelectedServiceProvider()
        const generator = streamDefinition(topic, 'en', undefined, undefined)
        
        for await (const chunk of generator) {
          if (signal.aborted) break
          setContent(chunk)
        }
      } catch (error) {
        console.error('Error generating content:', error)
        setContent(`Error generating content: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsGenerating(false)
      }
    }

    generateContent()

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [topic])

  return (
    <div>
      {isGenerating && <p>Generating...</p>}
      <div>{content}</div>
    </div>
  )
}

export default ContentGenerator
```

### 3. Service Provider Management

```javascript
import {
  ServiceProvider,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  hasApiKey
} from 'llm-service-provider'

// Get the currently selected service provider
const currentProvider = getSelectedServiceProvider()
console.log('Current selected service provider:', currentProvider)

// Select a specific service provider
setSelectedServiceProvider(ServiceProvider.GEMINI)

// Check if any API key is configured
const hasKey = hasApiKey()
console.log('Has API key configured:', hasKey)
```

## Supported Service Providers

- DeepSeek
- Gemini
- Groq (Meta)
- Xunfei Xinghuo
- YouChat

## Browser Compatibility

This module supports all modern browsers and uses localStorage to store API keys and user preferences.

## License

MIT