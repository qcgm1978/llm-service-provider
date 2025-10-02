import React, { useState, useEffect } from 'react'
import '../index.css'
import { 
  getPromptsByLanguage, 
  getLanguages 
} from './prompts'

import { 
  ServiceProvider, 
  getSelectedServiceProvider, 
  setSelectedServiceProvider,
  setDeepSeekApiKey,
  setGeminiApiKey,
  setXunfeiApiKey,
  setXunfeiApiSecret,
  setGroqApiKey,
  setOpenAiApiKey,
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  hasXunfeiApiKey,
  hasXunfeiApiSecret,
  hasYouChatApiKey,
  hasGroqApiKey,
  hasOpenAiApiKey,
  hasDoubaoApiKey,
  setDoubaoApiKey
} from '@qcgm1978/llm-core'

interface ApiKeyManagerProps {
  onSave: (apiKey: string) => void
  onClose: () => void
  onNavigateToWiki?: () => void
  isOpen: boolean
  onPromptTypeChange?: (promptType: string, category?: string, context?: string) => void
  defaultPromptType?: string
  language?: 'zh' | 'en'
  compactTemplate?: boolean
  styleVariant?: 'default' | 'comic1' | 'comic2'
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ 
  onSave,
  onClose,
  onNavigateToWiki,
  isOpen,
  onPromptTypeChange,
  defaultPromptType,
  language = 'zh',
  compactTemplate = false,
  styleVariant = 'default'
}) => {
  const [selectedPromptType, setSelectedPromptType] = useState(defaultPromptType || '简洁定义')
  const [category, setCategory] = useState('')
  const [context, setContext] = useState('')
  const [availablePrompts, setAvailablePrompts] = useState<string[]>([
    '简洁定义'
  ])
  const [availableLanguages, setAvailableLanguages] = useState(getLanguages())
  const [currentLanguage, setCurrentLanguage] = useState<"zh" | "en">((language === 'zh' || language === 'en') ? language : 'zh')

  useEffect(() => {
    const prompts = getPromptsByLanguage(currentLanguage)
    const promptTypes = prompts.map(prompt => prompt.act)
    setAvailablePrompts(promptTypes)
    
    if (defaultPromptType && promptTypes.includes(defaultPromptType)) {
      setSelectedPromptType(defaultPromptType)
      if (onPromptTypeChange) {
        onPromptTypeChange(defaultPromptType, category, context)
      }
    }
  }, [defaultPromptType, category, context, onPromptTypeChange, currentLanguage])

  const handleLanguageChange = (lang: 'zh' | 'en') => {
    setCurrentLanguage(lang)
  }

  const handlePromptTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPromptType = e.target.value
    setSelectedPromptType(newPromptType)
    if (onPromptTypeChange) {
      onPromptTypeChange(newPromptType, category, context)
    }
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value)
    if (onPromptTypeChange) {
      onPromptTypeChange(selectedPromptType, e.target.value, context)
    }
  }

  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContext(e.target.value)
    if (onPromptTypeChange) {
      onPromptTypeChange(selectedPromptType, category, e.target.value)
    }
  }

  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider>(
    ServiceProvider.XUNFEI
  )
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const provider = getSelectedServiceProvider()
      setSelectedProvider(provider)
  
      if (provider === ServiceProvider.DEEPSEEK) {
        const key = localStorage.getItem('DEEPSEEK_API_KEY') || ''
        setApiKey(key)
        setIsValid(hasDeepSeekApiKey())
        setApiSecret('')
      } else if (provider === ServiceProvider.GEMINI) {
        const key = localStorage.getItem('GEMINI_API_KEY') || ''
        setApiKey(key)
        setIsValid(hasGeminiApiKey())
        setApiSecret('')
      } else if (provider === ServiceProvider.GROQ) {
        const key = localStorage.getItem('GROQ_API_KEY') || ''
        setApiKey(key)
        setIsValid(hasGroqApiKey())
        setApiSecret('')
      } else if (provider === ServiceProvider.XUNFEI) {
        const key = localStorage.getItem('XUNFEI_API_KEY') || ''
        const secret = localStorage.getItem('XUNFEI_API_SECRET') || ''
        setApiKey(key)
        setApiSecret(secret)
        setIsValid(hasXunfeiApiKey() && hasXunfeiApiSecret())
      } else if (provider === ServiceProvider.YOUCHAT) {
        setApiKey('')
        setApiSecret('')
        setIsValid(true)
      } else {
        setApiKey('')
        setApiSecret('')
        setIsValid(false)
      }
    }
  }, [isOpen])

  const handleProviderChange = (provider: ServiceProvider) => {
    setSelectedProvider(provider)
    setSelectedServiceProvider(provider)
  
    if (provider === ServiceProvider.DEEPSEEK) {
      const key = localStorage.getItem('DEEPSEEK_API_KEY') || ''
      setApiKey(key)
      setApiSecret('')
      setIsValid(hasDeepSeekApiKey())
    } else if (provider === ServiceProvider.GEMINI) {
      const key = localStorage.getItem('GEMINI_API_KEY') || ''
      setApiKey(key)
      setApiSecret('')
      setIsValid(hasGeminiApiKey())
    } else if (provider === ServiceProvider.GROQ) {
      const key = localStorage.getItem('GROQ_API_KEY') || ''
      setApiKey(key)
      setApiSecret('')
      setIsValid(hasGroqApiKey())
    } else if (provider === ServiceProvider.XUNFEI) {
      const key = localStorage.getItem('XUNFEI_API_KEY') || ''
      const secret = localStorage.getItem('XUNFEI_API_SECRET') || ''
      setApiKey(key)
      setApiSecret(secret)
      setIsValid(hasXunfeiApiKey() && hasXunfeiApiSecret())
    } else if (provider === ServiceProvider.YOUCHAT) {
      setApiKey('')
      setApiSecret('')
      setIsValid(true)
      onSave('')
    } else {
      setApiKey('')
      setApiSecret('')
      setIsValid(false)
      onSave('')
    }
  }

  const handleSave = () => {
    if (selectedProvider === ServiceProvider.DEEPSEEK) {
      if (apiKey.trim()) {
        setDeepSeekApiKey(apiKey.trim())
        setIsValid(true)
        onSave(apiKey.trim())
      }
    } else if (selectedProvider === ServiceProvider.GEMINI) {
      if (apiKey.trim()) {
        setGeminiApiKey(apiKey.trim())
        setIsValid(true)
        onSave(apiKey.trim())
      }
    } else if (selectedProvider === ServiceProvider.GROQ) {
      if (apiKey.trim()) {
        setGroqApiKey(apiKey.trim())
        setIsValid(true)
        onSave(apiKey.trim())
      }
    } else if (selectedProvider === ServiceProvider.XUNFEI) {
      if (apiKey.trim() && apiSecret.trim()) {
        setXunfeiApiKey(apiKey.trim())
        setXunfeiApiSecret(apiSecret.trim())
        setIsValid(true)
        onSave(apiKey.trim())
      }
    }
    else if (selectedProvider === ServiceProvider.OPENAI) {
      if (apiKey.trim()) {
        setOpenAiApiKey(apiKey.trim())
        setIsValid(true)
        onSave(apiKey.trim())
      }
    } else if (selectedProvider === ServiceProvider.DOUBAO) {
      if (apiKey.trim()) {
        setDoubaoApiKey(apiKey.trim())
        setIsValid(true)
        onSave(apiKey.trim())
      }
    }

    onClose()

    if (onNavigateToWiki) {
      setTimeout(() => {
        onNavigateToWiki()
      }, 100)
    }
  }

  const handleClear = () => {
    if (selectedProvider === ServiceProvider.DEEPSEEK) {
      setDeepSeekApiKey('')
    } else if (selectedProvider === ServiceProvider.GEMINI) {
      setGeminiApiKey('')
    } else if (selectedProvider === ServiceProvider.GROQ) {
      setGroqApiKey('')
    } else if (selectedProvider === ServiceProvider.XUNFEI) {
      setXunfeiApiKey('')
      setXunfeiApiSecret('')
    }
    setApiKey('')
    setApiSecret('')
    setIsValid(false)
    onSave('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div id="api-key-manager" onClick={onClose}>
      <div
        className={`api-key-manager-container ${styleVariant === 'default' ? '' : `api-key-manager-${styleVariant}`}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="api-key-manager-close-btn"
        >
          ×
        </button>

        <h2 className="api-key-manager-title">
          {currentLanguage === 'zh' ? 'API 密钥配置' : 'API Key Configuration'}
        </h2>

        <div className="api-key-manager-section">
          <label className="api-key-manager-label">
            {currentLanguage === 'zh' 
              ? '服务提供商（讯飞星火/DeepSeek/Gemini/Meta/YouChat/OpenAI）' 
              : 'Service Provider (Xunfei/DeepSeek/Gemini/Meta/YouChat/OpenAI)'}
          </label>
          
          <div className="api-key-manager-provider-buttons">
            <button
              onClick={() => handleProviderChange(ServiceProvider.XUNFEI)}
              className={`api-key-manager-provider-btn ${selectedProvider === ServiceProvider.XUNFEI ? 'active' : ''}`}
            >
              {currentLanguage === 'zh' ? '讯飞星火' : 'Xunfei'}
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.DEEPSEEK)}
              className={`api-key-manager-provider-btn ${selectedProvider === ServiceProvider.DEEPSEEK ? 'active' : ''}`}
            >
              DeepSeek
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.GEMINI)}
              className={`api-key-manager-provider-btn ${selectedProvider === ServiceProvider.GEMINI ? 'active' : ''}`}
            >
              Gemini
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.GROQ)}
              className={`api-key-manager-provider-btn ${selectedProvider === ServiceProvider.GROQ ? 'active' : ''}`}
            >
              Meta
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.YOUCHAT)}
              className={`api-key-manager-provider-btn ${selectedProvider === ServiceProvider.YOUCHAT ? 'active' : ''}`}
            >
              YouChat
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.OPENAI)}
              className={`api-key-manager-provider-btn ${selectedProvider === ServiceProvider.OPENAI ? 'active' : ''}`}
            >
              OpenAI
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.DOUBAO)}
              className={`api-key-manager-provider-btn ${selectedProvider === ServiceProvider.DOUBAO ? 'active' : ''}`}
            >
              豆包
            </button>
          </div>
        </div>

        {(selectedProvider !== ServiceProvider.YOUCHAT) && (
          <>
            <div className="api-key-manager-input-group">
              <label
                htmlFor='apiKey'
                className="api-key-manager-label"
              >
                {selectedProvider === ServiceProvider.DEEPSEEK
                  ? currentLanguage === 'zh' ? 'DeepSeek API 密钥' : 'DeepSeek API Key'
                  : selectedProvider === ServiceProvider.GEMINI
                  ? currentLanguage === 'zh' ? 'Gemini API 密钥(需代理)' : 'Gemini API Key(Proxy Required)'
                  : selectedProvider === ServiceProvider.GROQ
                  ? currentLanguage === 'zh' ? 'Meta API 密钥(需代理)' : 'Meta API Key(Proxy Required)'
                  : selectedProvider === ServiceProvider.OPENAI
                  ? currentLanguage === 'zh' ? 'OpenAI API 密钥(需代理)' : 'OpenAI API Key(Proxy Required)'
                  : selectedProvider === ServiceProvider.DOUBAO
                  ? currentLanguage === 'zh' ? '豆包 API 密钥' : 'Doubao API Key'
                  : currentLanguage === 'zh' ? '讯飞 API Key' : 'Xunfei API Key'}
              </label>
              <div className="api-key-manager-input-wrapper">
                <input
                  id='apiKey'
                  type={showPassword ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => {
                    setApiKey(e.target.value)
                    if (selectedProvider === ServiceProvider.XUNFEI) {
                      setIsValid(e.target.value.length > 0 && apiSecret.length > 0)
                    } else {
                      setIsValid(e.target.value.length > 0)
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={currentLanguage === 'zh' 
                    ? `请输入你的 ${selectedProvider === ServiceProvider.XUNFEI ? '讯飞' : selectedProvider === ServiceProvider.DEEPSEEK ? 'DeepSeek' : selectedProvider === ServiceProvider.GEMINI ? 'Gemini' : selectedProvider === ServiceProvider.GROQ ? 'Groq' : selectedProvider === ServiceProvider.DOUBAO ? '豆包' : 'OpenAI'} ${selectedProvider === ServiceProvider.XUNFEI ? 'API Key' : 'API 密钥'}`
                    : `Please enter your ${selectedProvider === ServiceProvider.XUNFEI ? 'Xunfei' : selectedProvider === ServiceProvider.DEEPSEEK ? 'DeepSeek' : selectedProvider === ServiceProvider.GEMINI ? 'Gemini' : selectedProvider === ServiceProvider.GROQ ? 'Groq' : selectedProvider === ServiceProvider.DOUBAO ? 'Doubao' : 'OpenAI'} API Key`}
                  className="api-key-manager-input"
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className="api-key-manager-password-toggle"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {selectedProvider === ServiceProvider.XUNFEI && (
              <div className="api-key-manager-input-group">
                <label
                  htmlFor='apiSecret'
                  className="api-key-manager-label"
                >
                  {currentLanguage === 'zh' ? '讯飞 API Secret' : 'Xunfei API Secret'}
                </label>
                <div className="api-key-manager-input-wrapper">
                  <input
                    id='apiSecret'
                    type={showPassword ? 'text' : 'password'}
                    value={apiSecret}
                    onChange={e => {
                      setApiSecret(e.target.value)
                      setIsValid(apiKey.length > 0 && e.target.value.length > 0)
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={currentLanguage === 'zh' ? '请输入你的讯飞 API Secret' : 'Please enter your Xunfei API Secret'}
                    className="api-key-manager-input"
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className="api-key-manager-password-toggle"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            <p className="api-key-manager-info-text">
              💡 {currentLanguage === 'zh' ? '获取 API 密钥：' : 'Get API Key: '}
              {selectedProvider === ServiceProvider.XUNFEI ? (
                <a
                  href='https://console.xfyun.cn/app/myapp'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {currentLanguage === 'zh' ? '点击这里访问讯飞开放平台获取 API Key 和 Secret' : 'Click here to visit Xunfei Open Platform to get API Key and Secret'}
                </a>
              ) : (
                <a
                  href={
                    selectedProvider === ServiceProvider.DEEPSEEK
                      ? 'https://platform.deepseek.com/'
                      : selectedProvider === ServiceProvider.GEMINI
                      ? 'https://makersuite.google.com/app/apikey'
                      : selectedProvider === ServiceProvider.GROQ
                      ? 'https://console.groq.com/keys'
                      : selectedProvider === ServiceProvider.OPENAI
                      ? 'https://platform.openai.com/api-keys'
                      : selectedProvider === ServiceProvider.DOUBAO
                      ? 'https://console.volcengine.com/vei/aigateway/overview?'
                      : '#'
                  }
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {currentLanguage === 'zh' 
                    ? `点击这里访问 ${selectedProvider === ServiceProvider.DEEPSEEK ? 'DeepSeek' : selectedProvider === ServiceProvider.GEMINI ? 'Gemini' : selectedProvider === ServiceProvider.GROQ ? 'Groq' : selectedProvider === ServiceProvider.DOUBAO ? '豆包' : 'OpenAI'} 平台` 
                    : `Click here to visit ${selectedProvider === ServiceProvider.DEEPSEEK ? 'DeepSeek' : selectedProvider === ServiceProvider.GEMINI ? 'Gemini' : selectedProvider === ServiceProvider.GROQ ? 'Groq' : selectedProvider === ServiceProvider.DOUBAO ? 'Doubao' : 'OpenAI'} platform`}
                </a>
              )}
            </p>
          </>
        )}

        <div className="api-key-manager-actions">
          {selectedProvider !== ServiceProvider.XUNFEI &&
            selectedProvider !== ServiceProvider.YOUCHAT && (
              <button
                onClick={handleClear}
                className="api-key-manager-clear-btn"
              >
                {currentLanguage === 'zh' ? '清除' : 'Clear'}
              </button>
            )}
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="api-key-manager-save-btn"
          >
            {currentLanguage === 'zh' ? '保存' : 'Save'}
          </button>
        </div>
              
        {!compactTemplate && (selectedProvider !== ServiceProvider.YOUCHAT) && (
          <div className="api-key-manager-template-section">
            <h3 className="api-key-manager-template-title">
              {currentLanguage === 'zh' ? '提示模板设置' : 'Prompt Template Settings'}
            </h3>
            <div>
              <label
                className="api-key-manager-label"
              >
                {currentLanguage === 'zh' ? '选择提示类型' : 'Select Prompt Type'}
              </label>
            </div>
            
            <select
              value={selectedPromptType}
              onChange={handlePromptTypeChange}
              className="api-key-manager-select"
            >
              {availablePrompts.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {isValid && (
          <div className="api-key-manager-success-message">
            ✅{' '}
            {selectedProvider === ServiceProvider.DEEPSEEK
              ? 'DeepSeek'
              : selectedProvider === ServiceProvider.GEMINI
              ? 'Gemini'
              : selectedProvider === ServiceProvider.GROQ
              ? 'Groq'
              : selectedProvider === ServiceProvider.YOUCHAT
              ? 'YouChat'
              : selectedProvider === ServiceProvider.OPENAI
              ? 'OpenAI'
              : selectedProvider === ServiceProvider.DOUBAO
              ? '豆包'
              : currentLanguage === 'zh' ? '讯飞' : 'Xunfei'}{' '}
            {currentLanguage === 'zh' ? 'API 密钥已配置，应用可以正常使用' : 'API key has been configured, the application can be used normally'}
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiKeyManager
