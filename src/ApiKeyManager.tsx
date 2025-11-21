import React, { useState, useEffect } from "react";
import "../index.css";
import { 
  getPromptsByLanguage, 
  getLanguages
} from "./prompts";
import { 
  ServiceProvider,
  providerNamesConfig,
  getSelectedServiceProvider,
  setSelectedServiceProvider,
  getProviderCredentials,
  saveProviderCredentials,
  clearProviderCredentials,
  validateCredentials,
  getProviderApiKeyLink,
  getProviderDisplayName
} from "../llm-core/src";
import { HUNYUAN_MODELS } from "../llm-core/src/hunyuanService";

import {
  getDefaultModel,
  OPENROUTER_MODELS,
  setSelectedModel,
} from "../llm-core/src/openrouterService";

interface ApiKeyManagerProps {
  onSave: (apiKey: string) => void;
  onClose: () => void;
  onNavigateToWiki?: () => void;
  isOpen: boolean;
  onPromptTypeChange?: (
    promptType: string,
    category?: string,
    context?: string
  ) => void;
  defaultPromptType?: string;
  language?: "zh" | "en";
  compactTemplate?: boolean;
  styleVariant?: "default" | "comic1" | "comic2";
  showCloseButton?: boolean;
}

const ApiKeyManager = ({
  onSave,
  onClose,
  onNavigateToWiki,
  isOpen,
  onPromptTypeChange,
  defaultPromptType,
  language = "zh",
  showCloseButton = true,
  compactTemplate = false,
  styleVariant = "default",
}) => {
  const storedPromptType = localStorage.getItem("SELECTED_PROMPT_TEMPLATE");
  const [selectedPromptType, setSelectedPromptType] = useState(
    storedPromptType || defaultPromptType || "简洁定义"
  );
  const defaultOpenrouterModel = getDefaultModel();
  const [selectedOpenrouterModel, setSelectedOpenrouterModel] = useState(
    defaultOpenrouterModel
  );
  const customSetSelectedOpenrouterModel = (model: string) => {
    setSelectedOpenrouterModel(model);
    setSelectedModel(model);
  };
  const updateSelectedPromptType = (value: string) => {
    setSelectedPromptType(value);
    localStorage.setItem("SELECTED_PROMPT_TEMPLATE", value);
  };
  const [category, setCategory] = useState("");
  const [context, setContext] = useState("");
  const [availablePrompts, setAvailablePrompts] = useState<string[]>([
    "简洁定义",
  ]);
  const [availableLanguages, setAvailableLanguages] = useState(getLanguages());
  const [currentLanguage, setCurrentLanguage] = useState<"zh" | "en">(
    language === "zh" || language === "en" ? language : "zh"
  );

  useEffect(() => {
    const prompts = getPromptsByLanguage(currentLanguage);
    const promptTypes = prompts.map((prompt) => prompt.act);
    setAvailablePrompts(promptTypes);

    if (defaultPromptType && promptTypes.includes(defaultPromptType)) {
      updateSelectedPromptType(defaultPromptType); // 使用自定义函数
      if (onPromptTypeChange) {
        onPromptTypeChange(defaultPromptType, category, context);
      }
    }
  }, [
    defaultPromptType,
    category,
    context,
    onPromptTypeChange,
    currentLanguage,
  ]);

  const handleLanguageChange = (lang: "zh" | "en") => {
    setCurrentLanguage(lang);
  };

  const handlePromptTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPromptType = e.target.value;
    updateSelectedPromptType(newPromptType); // 使用自定义函数
    if (onPromptTypeChange) {
      onPromptTypeChange(newPromptType, category, context);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
    if (onPromptTypeChange) {
      onPromptTypeChange(selectedPromptType, e.target.value, context);
    }
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContext(e.target.value);
    if (onPromptTypeChange) {
      onPromptTypeChange(selectedPromptType, category, e.target.value);
    }
  };

  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider>(
    ServiceProvider.DEEPSEEK
  );
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 辅助函数：处理服务提供商选择的逻辑
  const handleProviderSelection = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    const credentials = getProviderCredentials(provider);
    setApiKey(credentials.apiKey);
    setApiSecret(credentials.apiSecret);
    setIsValid(credentials.isValid);
  };

  useEffect(() => {
    if (isOpen) {
      const provider = getSelectedServiceProvider();
      handleProviderSelection(provider);
    }
  }, [isOpen]);

  const handleProviderChange = (provider: ServiceProvider) => {
    handleProviderSelection(provider);
    setSelectedServiceProvider(provider);

    if (
      provider !== ServiceProvider.DEEPSEEK &&
      provider !== ServiceProvider.GEMINI &&
      provider !== ServiceProvider.GROQ &&
      provider !== ServiceProvider.XUNFEI &&
      provider !== ServiceProvider.OPENAI &&
      provider !== ServiceProvider.DOUBAO &&
      provider !== ServiceProvider.OPENROUTER &&
      provider !== ServiceProvider.MOONSHOT &&
      provider !== ServiceProvider.IFLOW &&
      provider !== ServiceProvider.HUNYUAN &&
      provider !== ServiceProvider.YOUCHAT
    ) {
      onSave("");
    }
  };

  const handleSave = () => {
    const saved = saveProviderCredentials(selectedProvider, apiKey, apiSecret);

    if (saved) {
      setIsValid(true);
      onSave(apiKey.trim());
      // 确保保存API密钥后切换到相应的服务提供商
      setSelectedServiceProvider(selectedProvider);
    }

    onClose();

    if (onNavigateToWiki) {
      setTimeout(() => {
        onNavigateToWiki();
      }, 100);
    }
  };
  const handleClose = () => {
    onClose();
  };

  const handleClear = () => {
    clearProviderCredentials(selectedProvider);
    setApiKey("");
    setApiSecret("");
    setIsValid(false);
    onSave("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  if (!isOpen) return null;

  const enable_vpn = selectedProvider === ServiceProvider.YOUCHAT || selectedProvider === ServiceProvider.GROQ || selectedProvider === ServiceProvider.GEMINI || selectedProvider === ServiceProvider.OPENAI || selectedProvider === ServiceProvider.IFLOW;
  return (
    <div id="api-key-manager" onClick={onClose}>
      <div
        className={`api-key-manager-container ${
          styleVariant === "default" ? "" : `api-key-manager-${styleVariant}`
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button onClick={handleClose} className="api-key-manager-close-btn">
              {currentLanguage === "zh" ? "关闭" : "Close"}
          </button>
        )}

        <h2 className="api-key-manager-title">
          {currentLanguage === "zh" ? "API 密钥配置" : "API Key Configuration"}
        </h2>

        <div className="api-key-manager-section">
          <label className="api-key-manager-label">
            {currentLanguage === "zh"
              ? "服务提供商（讯飞星火/DeepSeek/Gemini/Meta/YouChat/OpenAI）"
              : "Service Provider (Xunfei/DeepSeek/Gemini/Meta/YouChat/OpenAI)"}
          </label>

          <div className="api-key-manager-provider-buttons">
            <button
              onClick={() => handleProviderChange(ServiceProvider.XUNFEI)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.XUNFEI ? "active" : ""
              }`}
            >
              {currentLanguage === "zh" ? "讯飞星火" : "Xunfei"}
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.DEEPSEEK)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.DEEPSEEK ? "active" : ""
              }`}
            >
              DeepSeek
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.GEMINI)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.GEMINI ? "active" : ""
              }`}
            >
              Gemini
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.GROQ)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.GROQ ? "active" : ""
              }`}
            >
              Groq
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.MOONSHOT)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.MOONSHOT ? "active" : ""
              }`}
            >
              {currentLanguage === "zh" ? "月之暗面" : "Moonshot"}
            </button>

            <button
              onClick={() => handleProviderChange(ServiceProvider.OPENAI)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.OPENAI ? "active" : ""
              }`}
            >
              OpenAI
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.DOUBAO)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.DOUBAO ? "active" : ""
              }`}
            >
              {currentLanguage === "zh" ? "豆包" : "Doubao"}
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.OPENROUTER)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.OPENROUTER ? "active" : ""
              }`}
            >
              OpenRouter
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.YOUCHAT)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.YOUCHAT ? "active" : ""
              }`}
            >
              YouChat
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.IFLOW)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.IFLOW ? "active" : ""
              }`}
            >
              {currentLanguage === "zh" ? "心流" : "iFlow"}
            </button>
            <button
              onClick={() => handleProviderChange(ServiceProvider.HUNYUAN)}
              className={`api-key-manager-provider-btn ${
                selectedProvider === ServiceProvider.HUNYUAN ? "active" : ""
              }`}
            >
              {currentLanguage === "zh" ? "混元" : "Hunyuan"}
            </button>
          </div>
        </div>

        <>
          <div className="api-key-manager-input-group">
            <label htmlFor="apiKey" className="api-key-manager-label">
              {
                providerNamesConfig[selectedProvider]?.[
                  currentLanguage === "zh" ? "zh" : "en"
                ]
              }{
                " "
              }API {currentLanguage === "zh" ? "密钥" : "Key"}
              {selectedProvider === ServiceProvider.GEMINI ||
                selectedProvider === ServiceProvider.OPENAI}
              {selectedProvider === ServiceProvider.OPENROUTER &&
              currentLanguage === "zh"
                ? "(通义千问3)"
                : ""}
            </label>
            <div className="api-key-manager-input-wrapper">
              <input
                id="apiKey"
                type={showPassword ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setIsValid(
                    validateCredentials(
                      selectedProvider,
                      e.target.value,
                      apiSecret
                    )
                  );
                }}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentLanguage === "zh"
                    ? `请输入你的 ${selectedProvider === ServiceProvider.XUNFEI
                          ? "讯飞"
                          : selectedProvider === ServiceProvider.DEEPSEEK
                          ? "DeepSeek"
                          : selectedProvider === ServiceProvider.GEMINI
                          ? "Gemini"
                          : selectedProvider === ServiceProvider.GROQ
                          ? "Groq"
                          : selectedProvider === ServiceProvider.DOUBAO
                          ? "豆包"
                          : selectedProvider === ServiceProvider.OPENROUTER
                          ? "OpenRouter"
                          : selectedProvider === ServiceProvider.MOONSHOT
                          ? "Moonshot"
                          : selectedProvider === ServiceProvider.IFLOW
                          ? "心流"
                          : selectedProvider === ServiceProvider.YOUCHAT
                          ? "YouChat"
                          : "OpenAI"
                      } ${selectedProvider === ServiceProvider.XUNFEI
                          ? "API Key"
                          : "API 密钥"}`
                    : `Please enter your ${selectedProvider === ServiceProvider.XUNFEI
                          ? "Xunfei"
                          : selectedProvider === ServiceProvider.DEEPSEEK
                          ? "DeepSeek"
                          : selectedProvider === ServiceProvider.GEMINI
                          ? "Gemini"
                          : selectedProvider === ServiceProvider.GROQ
                          ? "Groq"
                          : selectedProvider === ServiceProvider.DOUBAO
                          ? "Doubao"
                          : selectedProvider === ServiceProvider.OPENROUTER
                          ? "OpenRouter"
                          : selectedProvider === ServiceProvider.IFLOW
                          ? "iFlow"
                          : selectedProvider === ServiceProvider.YOUCHAT
                          ? "YouChat"
                          : "OpenAI"
                      } API Key`
                }
                className="api-key-manager-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="api-key-manager-password-toggle"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {selectedProvider === ServiceProvider.XUNFEI && (
            <div className="api-key-manager-input-group">
              <label htmlFor="apiSecret" className="api-key-manager-label">
                {currentLanguage === "zh"
                  ? "讯飞 API Secret"
                  : "Xunfei API Secret"}
              </label>
              <div className="api-key-manager-input-wrapper">
                <input
                  id="apiSecret"
                  type={showPassword ? "text" : "password"}
                  value={apiSecret}
                  onChange={(e) => {
                    setApiSecret(e.target.value);
                    setIsValid(
                      validateCredentials(
                        selectedProvider,
                        apiKey,
                        e.target.value
                      )
                    );
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    currentLanguage === "zh"
                      ? "请输入你的讯飞 API Secret"
                      : "Please enter your Xunfei API Secret"
                  }
                  className="api-key-manager-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="api-key-manager-password-toggle"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          )}

          <p className="api-key-manager-info-text">
            💡{
              " "
            }{currentLanguage === "zh" ? "获取 API 密钥：" : "Get API Key: "}
            {selectedProvider === ServiceProvider.XUNFEI ? (
              <a
                href="https://console.xfyun.cn/app/myapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                {currentLanguage === "zh"
                  ? "点击这里访问讯飞开放平台获取 API Key 和 Secret"
                  : "Click here to visit Xunfei Open Platform to get API Key and Secret"}
              </a>
            ) : selectedProvider === ServiceProvider.YOUCHAT ? (
              <a
                href="https://you.com/platform/api-keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                {currentLanguage === "zh"
                  ? "点击这里访问 YouChat 平台获取 API Key"
                  : "Click here to visit YouChat platform to get API Key"}
              </a>
            ) : (
              <a
                href={getProviderApiKeyLink(selectedProvider)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {currentLanguage === "zh"
                  ? `点击这里访问 ${providerNamesConfig[selectedProvider]?.zh || providerNamesConfig[selectedProvider]?.en} 平台`
                  : `Click here to visit ${providerNamesConfig[selectedProvider]?.en || providerNamesConfig[selectedProvider]?.zh} platform`}
              </a>
            )}
          </p>
        </>
        {(enable_vpn) && (
          <div className="api-key-manager-input-group">
            <label htmlFor="apiKey" className="api-key-manager-label">
              {currentLanguage === "zh" ? "(需代理)" : ""}
            </label>
          </div>
        )}
        {selectedProvider === ServiceProvider.OPENROUTER && (
          <div className="api-key-manager-model-section">
            <label className="api-key-manager-label">
              {currentLanguage === "zh" ? "选择模型" : "Select Model"}
            </label>
            <select
              value={selectedOpenrouterModel}
              onChange={(e) => customSetSelectedOpenrouterModel(e.target.value)}
              className="api-key-manager-select"
            >
              {Object.entries(OPENROUTER_MODELS).map(([model, label]) => (
                <option key={model} value={model}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}
        {selectedProvider === ServiceProvider.HUNYUAN && (
          <div className="api-key-manager-model-section">
            <label className="api-key-manager-label">
              {currentLanguage === "zh" ? "选择模型" : "Select Model"}
            </label>
            <select
              value={selectedOpenrouterModel}
              onChange={(e) => customSetSelectedOpenrouterModel(e.target.value)}
              className="api-key-manager-select"
            >
              {Object.entries(HUNYUAN_MODELS).map(([model, label]) => (
                <option key={model} value={model}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="api-key-manager-actions">
          {selectedProvider !== ServiceProvider.XUNFEI && (
            <button
              onClick={handleClear}
              className="api-key-manager-clear-btn"
            >
              {currentLanguage === "zh" ? "清除" : "Clear"}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="api-key-manager-save-btn"
          >
            {currentLanguage === "zh" ? "保存" : "Save"}
          </button>
        </div>

        {!compactTemplate && (
            <div className="api-key-manager-template-section">
              <h3 className="api-key-manager-template-title">
                {currentLanguage === "zh"
                  ? "提示模板设置"
                  : "Prompt Template Settings"}
              </h3>
              <div className="api-key-manager-section">
                <label className="api-key-manager-label">
                  {currentLanguage === "zh"
                    ? "语言 / Language"
                    : "Language / 语言"}
                </label>
                <select
                  value={currentLanguage}
                  onChange={(e) =>
                    handleLanguageChange(e.target.value as "zh" | "en")
                  }
                  className="api-key-manager-select"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="api-key-manager-label">
                  {currentLanguage === "zh"
                    ? "选择提示类型"
                    : "Select Prompt Type"}
                </label>
              </div>

              <select
                value={selectedPromptType}
                onChange={handlePromptTypeChange}
                className="api-key-manager-select"
              >
                {availablePrompts.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}

        {isValid && (
            <div className="api-key-manager-success-message">
              ✅
              {selectedProvider === ServiceProvider.DEEPSEEK && "DeepSeek"}
              {selectedProvider === ServiceProvider.GEMINI && "Gemini"}
              {selectedProvider === ServiceProvider.GROQ && "Groq"}
              {selectedProvider === ServiceProvider.YOUCHAT && "YouChat"}
              {selectedProvider === ServiceProvider.OPENAI && "OpenAI"}
              {selectedProvider === ServiceProvider.DOUBAO && "豆包"}
              {selectedProvider === ServiceProvider.OPENROUTER && "OpenRouter"}
              {selectedProvider === ServiceProvider.MOONSHOT && 
                (currentLanguage === "zh" ? "月之暗面" : "Moonshot")
              }
              {selectedProvider === ServiceProvider.IFLOW && 
                (currentLanguage === "zh" ? "心流" : "iFlow")
              }
              {selectedProvider === ServiceProvider.XUNFEI && 
                (currentLanguage === "zh" ? "讯飞" : "Xunfei")
              }
              {selectedProvider === ServiceProvider.HUNYUAN && 
                (currentLanguage === "zh" ? "混元" : "Hunyuan")
              }
              {" "}{currentLanguage === "zh" 
                ? "API 密钥已配置，应用可以正常使用" 
                : "API key has been configured, the application can be used normally"}
            </div>
          )}
      </div>
    </div>
  );
};

// 添加可导出的函数
export const updateSelectedPromptType = (value: string) => {
  localStorage.setItem("SELECTED_PROMPT_TEMPLATE", value);
};

export default ApiKeyManager;
