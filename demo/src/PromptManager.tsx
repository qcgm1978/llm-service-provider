import React, { useState, useEffect } from 'react';
import { getPromptsByLanguage, getLanguages, updatePrompt, resetPrompts } from '../../llm-core/src/prompts';
import './styles/promptManager.css';

interface PromptManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const PromptManager: React.FC<PromptManagerProps> = ({ isOpen, onClose, onSave }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('zh');
  const [prompts, setPrompts] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      setLanguages(getLanguages());
      loadPrompts();
    }
  }, [isOpen, selectedLanguage]);
  
  const loadPrompts = () => {
    const langPrompts = getPromptsByLanguage(selectedLanguage);
    setPrompts(langPrompts.map(prompt => ({ ...prompt })));
  };
  
  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index].prompt = value;
    setPrompts(newPrompts);
  };
  
  const handleAddPrompt = () => {
    const newPrompt = {
      act: `新提示${prompts.length + 1}`,
      prompt: '请输入提示内容...'
    };
    setPrompts([...prompts, newPrompt]);
  };
  
  const handleSave = () => {
    prompts.forEach(prompt => {
      updatePrompt(prompt.act, prompt.prompt, selectedLanguage as 'zh' | 'en');
    });
    onSave();
    onClose();
  };
  
  const handleReset = () => {
    if (window.confirm('确定要重置所有提示模板到默认值吗？这将丢失您的所有自定义修改。')) {
      resetPrompts();
      loadPrompts();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="prompt-manager-overlay">
      <div className="prompt-manager">
        <div className="prompt-manager-header">
          <h2>提示模板管理</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="prompt-manager-content">
          <div className="language-selector">
            <label>选择语言：</label>
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          
          <div className="prompts-list">
            {prompts.map((prompt, index) => (
              <div key={index} className="prompt-item">
                <div className="prompt-name">{prompt.act}</div>
                <textarea
                  value={prompt.prompt}
                  onChange={(e) => handlePromptChange(index, e.target.value)}
                  placeholder="请输入提示内容..."
                  className="prompt-textarea"
                />
              </div>
            ))}
          </div>
          
          <div className="prompt-manager-actions">
            <button onClick={handleAddPrompt}>添加新提示</button>
            <button onClick={handleReset} className="reset-button">重置默认值</button>
          </div>
        </div>
        
        <div className="prompt-manager-footer">
          <button onClick={onClose}>取消</button>
          <button onClick={handleSave} className="save-button">保存修改</button>
        </div>
      </div>
    </div>
  );
};

export default PromptManager;