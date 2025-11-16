// 声明chrome和browser全局变量类型
declare const chrome: any;
declare const browser: any;

import { isExtensionEnvironment, getEnvironmentType } from './utils';

/**
 * 演示如何使用环境判断函数
 */
export function demonstrateEnvironmentDetection() {
  // 获取当前环境类型
  const environmentType = getEnvironmentType();
  console.log('Current environment type:', environmentType);
  
  // 根据环境类型执行不同操作
  switch (environmentType) {
    case 'browser':
      handleBrowserEnvironment();
      break;
    case 'extension':
      handleExtensionEnvironment();
      break;
    case 'node':
      handleNodeEnvironment();
      break;
  }
}

/**
 * 处理浏览器页面环境
 */
function handleBrowserEnvironment() {
  console.log('Running in browser page environment');
  
  // 在浏览器环境中使用localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    console.log('Browser localStorage is available');
    // 这里可以添加浏览器特有的操作
  }
}

/**
 * 处理浏览器扩展环境
 */
function handleExtensionEnvironment() {
  console.log('Running in browser extension environment');
  
  // 在扩展环境中使用扩展API
  if (typeof chrome !== 'undefined' && chrome.storage) {
    console.log('Chrome extension storage is available');
    // 这里可以添加扩展特有的操作
  }
  
  if (typeof browser !== 'undefined' && browser.storage) {
    console.log('Firefox extension storage is available');
    // 这里可以添加扩展特有的操作
  }
}

/**
 * 处理Node.js环境
 */
function handleNodeEnvironment() {
  console.log('Running in Node.js environment');
  
  // 在Node.js环境中使用环境变量
  if (typeof process !== 'undefined' && process.env) {
    console.log('Node.js environment variables are available');
    // 这里可以添加Node.js特有的操作
  }
}

/**
 * 安全地保存数据，根据环境选择合适的存储方式
 */
export function saveDataSecurely(key: string, value: string): void {
  if (isExtensionEnvironment()) {
    // 在扩展环境中使用扩展的存储API
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [key]: value });
    } else if (typeof browser !== 'undefined' && browser.storage) {
      browser.storage.local.set({ [key]: value });
    }
  } else if (typeof window !== 'undefined' && window.localStorage) {
    // 在浏览器页面环境中使用localStorage
    localStorage.setItem(key, value);
  } else if (typeof process !== 'undefined' && process.env) {
    // 在Node.js环境中，可以记录日志或使用其他存储方式
    console.log(`Would save data in Node.js: ${key}=${value}`);
  }
}