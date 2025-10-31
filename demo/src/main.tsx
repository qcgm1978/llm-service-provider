import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import SimpleApiKeyManager from './SimpleApiKeyManager.tsx'
import './styles.css'

// 检查URL参数
const urlParams = new URLSearchParams(window.location.search);
const isSimpleView = urlParams.get('simple') === 'true';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isSimpleView ? <SimpleApiKeyManager /> : <App />}
  </React.StrictMode>,
)