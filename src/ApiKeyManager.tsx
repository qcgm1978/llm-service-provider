// 在文件顶部导入必要的模块
import React, { useState, useEffect } from 'react'
import {
  getPromptByName,
  getPromptsByLanguage
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
  hasDeepSeekApiKey,
  hasGeminiApiKey,
  hasXunfeiApiKey,
  hasXunfeiApiSecret,
  hasYouChatApiKey,
  hasGroqApiKey
} from './llmService'

interface ApiKeyManagerProps {
  onSave: (apiKey: string) => void
  onClose: () => void
  onNavigateToWiki?: () => void
  isOpen: boolean
  onPromptTypeChange?: (promptType: string, category?: string, context?: string) => void
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  onSave,
  onClose,
  onNavigateToWiki,
  isOpen,
  onPromptTypeChange
}) => {
  // 添加新的状态
  const [selectedPromptType, setSelectedPromptType] = useState('简洁定义')
  const [category, setCategory] = useState('')
  const [context, setContext] = useState('')
  const [availablePrompts, setAvailablePrompts] = useState<string[]>([
    '简洁定义'
  ])

  // 加载可用的提示模板类型
  useEffect(() => {
    const prompts = getPromptsByLanguage('zh')
    const promptTypes = prompts.map(prompt => prompt.act)
    setAvailablePrompts(promptTypes)
  }, [])

  // 处理提示类型变化
  const handlePromptTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPromptType = e.target.value
    setSelectedPromptType(newPromptType)
    if (onPromptTypeChange) {
      onPromptTypeChange(newPromptType, category, context)
    }
  }

  // 处理category变化
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value)
    if (onPromptTypeChange) {
      onPromptTypeChange(selectedPromptType, e.target.value, context)
    }
  }

  // 处理context变化
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
        const key =
          typeof window !== 'undefined'
            ? localStorage.getItem('DEEPSEEK_API_KEY') || ''
            : ''
        setApiKey(key)
        setIsValid(hasDeepSeekApiKey())
        setApiSecret('')
      } else if (provider === ServiceProvider.GEMINI) {
        const key =
          typeof window !== 'undefined'
            ? localStorage.getItem('GEMINI_API_KEY') || ''
            : ''
        setApiKey(key)
        setIsValid(hasGeminiApiKey())
        setApiSecret('')
      } else if (provider === ServiceProvider.GROQ) {
        const key =
          typeof window !== 'undefined'
            ? localStorage.getItem('GROQ_API_KEY') || ''
            : ''
        setApiKey(key)
        setIsValid(hasGroqApiKey())
        setApiSecret('')
      } else if (provider === ServiceProvider.XUNFEI) {
        const key =
          typeof window !== 'undefined'
            ? localStorage.getItem('XUNFEI_API_KEY') || ''
            : ''
        const secret =
          typeof window !== 'undefined'
            ? localStorage.getItem('XUNFEI_API_SECRET') || ''
            : ''
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
      const key =
        typeof window !== 'undefined'
          ? localStorage.getItem('DEEPSEEK_API_KEY') || ''
          : ''
      setApiKey(key)
      setApiSecret('')
      setIsValid(hasDeepSeekApiKey())
    } else if (provider === ServiceProvider.GEMINI) {
      const key =
        typeof window !== 'undefined'
          ? localStorage.getItem('GEMINI_API_KEY') || ''
          : ''
      setApiKey(key)
      setApiSecret('')
      setIsValid(hasGeminiApiKey())
    } else if (provider === ServiceProvider.GROQ) {
      const key =
        typeof window !== 'undefined'
          ? localStorage.getItem('GROQ_API_KEY') || ''
          : ''
      setApiKey(key)
      setApiSecret('')
      setIsValid(hasGroqApiKey())
    } else if (provider === ServiceProvider.XUNFEI) {
      const key =
        typeof window !== 'undefined'
          ? localStorage.getItem('XUNFEI_API_KEY') || ''
          : ''
      const secret =
        typeof window !== 'undefined'
          ? localStorage.getItem('XUNFEI_API_SECRET') || ''
          : ''
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxWidth: '500px',
          width: '90%',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2c3e50' }}>
          API 密钥配置
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#34495e'
            }}
          >
            服务提供商（讯飞星火/DeepSeek/Gemini/Meta/YouChat）
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleProviderChange(ServiceProvider.XUNFEI)}
              style={{
                padding: '0.5rem 1rem',
                border:
                  selectedProvider === ServiceProvider.XUNFEI
                    ? '2px solid #3498db'
                    : '2px solid #e1e8ed',
                backgroundColor:
                  selectedProvider === ServiceProvider.XUNFEI
                    ? '#3498db'
                    : 'white',
                color:
                  selectedProvider === ServiceProvider.XUNFEI
                    ? 'white'
                    : '#34495e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              讯飞星火
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.DEEPSEEK)}
              style={{
                padding: '0.5rem 1rem',
                border:
                  selectedProvider === ServiceProvider.DEEPSEEK
                    ? '2px solid #3498db'
                    : '2px solid #e1e8ed',
                backgroundColor:
                  selectedProvider === ServiceProvider.DEEPSEEK
                    ? '#3498db'
                    : 'white',
                color:
                  selectedProvider === ServiceProvider.DEEPSEEK
                    ? 'white'
                    : '#34495e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              DeepSeek
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.GEMINI)}
              style={{
                padding: '0.5rem 1rem',
                border:
                  selectedProvider === ServiceProvider.GEMINI
                    ? '2px solid #3498db'
                    : '2px solid #e1e8ed',
                backgroundColor:
                  selectedProvider === ServiceProvider.GEMINI
                    ? '#3498db'
                    : 'white',
                color:
                  selectedProvider === ServiceProvider.GEMINI
                    ? 'white'
                    : '#34495e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              Gemini
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.GROQ)}
              style={{
                padding: '0.5rem 1rem',
                border:
                  selectedProvider === ServiceProvider.GROQ
                    ? '2px solid #3498db'
                    : '2px solid #e1e8ed',
                backgroundColor:
                  selectedProvider === ServiceProvider.GROQ
                    ? '#3498db'
                    : 'white',
                color:
                  selectedProvider === ServiceProvider.GROQ
                    ? 'white'
                    : '#34495e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              Meta
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.YOUCHAT)}
              style={{
                padding: '0.5rem 1rem',
                border:
                  selectedProvider === ServiceProvider.YOUCHAT
                    ? '2px solid #3498db'
                    : '2px solid #e1e8ed',
                backgroundColor:
                  selectedProvider === ServiceProvider.YOUCHAT
                    ? '#3498db'
                    : 'white',
                color:
                  selectedProvider === ServiceProvider.YOUCHAT
                    ? 'white'
                    : '#34495e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              YouChat
            </button>
          </div>
        </div>

        {
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor='apiKey'
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#34495e'
                }}
              >
                {selectedProvider === ServiceProvider.DEEPSEEK
                  ? 'DeepSeek API 密钥'
                  : selectedProvider === ServiceProvider.GEMINI
                  ? 'Gemini API 密钥(需代理)'
                  : selectedProvider === ServiceProvider.GROQ
                  ? 'Meta API 密钥(需代理)'
                  : selectedProvider === ServiceProvider.YOUCHAT
                  ? '(需代理)'
                  : '讯飞 API Key'}
              </label>
              {selectedProvider !== ServiceProvider.YOUCHAT && (
                <div style={{ position: 'relative' }}>
                  <input
                    id='apiKey'
                    type={showPassword ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => {
                      setApiKey(e.target.value)
                      if (selectedProvider === ServiceProvider.XUNFEI) {
                        setIsValid(
                          e.target.value.length > 0 && apiSecret.length > 0
                        )
                      } else {
                        setIsValid(e.target.value.length > 0)
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={`请输入你的 ${
                      selectedProvider === ServiceProvider.DEEPSEEK
                        ? 'DeepSeek'
                        : selectedProvider === ServiceProvider.GEMINI
                        ? 'Gemini'
                        : selectedProvider === ServiceProvider.GROQ
                        ? 'Groq'
                        : '讯飞'
                    } ${
                      selectedProvider === ServiceProvider.XUNFEI
                        ? 'API Key'
                        : 'API 密钥'
                    }`}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e8ed',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '1rem'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              )}
            </div>

            {selectedProvider === ServiceProvider.XUNFEI && (
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor='apiSecret'
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#34495e'
                  }}
                >
                  讯飞 API Secret
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id='apiSecret'
                    type={showPassword ? 'text' : 'password'}
                    value={apiSecret}
                    onChange={e => {
                      setApiSecret(e.target.value)
                      setIsValid(apiKey.length > 0 && e.target.value.length > 0)
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder='请输入你的讯飞 API Secret'
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e8ed',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease'
                    }}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '1rem'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            {selectedProvider !== ServiceProvider.YOUCHAT && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f8c8d' }}>
                  💡 获取 API 密钥：
                  {selectedProvider === ServiceProvider.XUNFEI ? (
                    <a
                      href='https://console.xfyun.cn/app/myapp'
                      target='_blank'
                      rel='noopener noreferrer'
                      style={{ color: '#3498db', textDecoration: 'none' }}
                    >
                      点击这里访问讯飞开放平台获取 API Key 和 Secret
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
                          : '#'
                      }
                      target='_blank'
                      rel='noopener noreferrer'
                      style={{ color: '#3498db', textDecoration: 'none' }}
                    >
                      点击这里访问{' '}
                      {selectedProvider === ServiceProvider.DEEPSEEK
                        ? 'DeepSeek'
                        : selectedProvider === ServiceProvider.GEMINI
                        ? 'Gemini'
                        : 'Groq'}{' '}
                      平台
                    </a>
                  )}
                </p>
              </div>
            )}
          </>
        }

        <div
          style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}
        >
          {selectedProvider !== ServiceProvider.XUNFEI &&
            selectedProvider !== ServiceProvider.YOUCHAT && (
              <button
                onClick={handleClear}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #e74c3c',
                  backgroundColor: 'white',
                  color: '#e74c3c',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#e74c3c'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.color = '#e74c3c'
                }}
              >
                清除
              </button>
            )}
          <button
            onClick={handleSave}
            disabled={!isValid}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              backgroundColor: isValid ? '#3498db' : '#bdc3c7',
              color: 'white',
              borderRadius: '8px',
              cursor: isValid ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => {
              if (isValid) {
                e.currentTarget.style.backgroundColor = '#2980b9'
              }
            }}
            onMouseLeave={e => {
              if (isValid) {
                e.currentTarget.style.backgroundColor = '#3498db'
              }
            }}
          >
            保存
          </button>
          
        </div>
             <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2c3e50', fontSize: '1.1rem' }}>
            提示模板设置
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#34495e'
              }}
            >
              选择提示类型
            </label>
            <select
              value={selectedPromptType}
              onChange={handlePromptTypeChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e1e8ed',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              {availablePrompts.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {selectedPromptType === 'wiki' && (
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#34495e'
                }}
              >
                输入类别
              </label>
              <input
                type='text'
                value={category}
                onChange={handleCategoryChange}
                placeholder='输入类别...'
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {selectedPromptType === '带上下文回答' && (
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#34495e'
                }}
              >
                输入上下文信息
              </label>
              <textarea
                value={context}
                onChange={handleContextChange}
                placeholder='输入上下文信息...'
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>
          )}
        </div>
        {isValid && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '6px',
              color: '#155724',
              fontSize: '0.9rem'
            }}
          >
            ✅{' '}
            {selectedProvider === ServiceProvider.DEEPSEEK
              ? 'DeepSeek'
              : selectedProvider === ServiceProvider.GEMINI
              ? 'Gemini'
              : selectedProvider === ServiceProvider.GROQ
              ? 'Groq'
              : selectedProvider === ServiceProvider.YOUCHAT
              ? 'YouChat'
              : '讯飞'}{' '}
            API 密钥已配置，应用可以正常使用
          </div>
        )}
      </div>
      

    </div>
  )
}

export default ApiKeyManager
