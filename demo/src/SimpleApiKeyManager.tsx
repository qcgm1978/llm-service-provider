import React, { useState } from 'react';
import { ApiKeyManager } from '../../src';

const SimpleApiKeyManager: React.FC = () => {
  const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(true);
  const [selectedPromptType, setSelectedPromptType] = useState<string>('default');

  return (
    <div style={{ padding: '20px' }}>
      <ApiKeyManager
        onSave={() => {}}
        onClose={() => setIsApiKeyManagerOpen(false)}
        isOpen={isApiKeyManagerOpen}
        defaultPromptType={selectedPromptType}
        language="zh"
        compactTemplate={false}
        styleVariant="comic2"
      />
    </div>
  );
};

export default SimpleApiKeyManager;