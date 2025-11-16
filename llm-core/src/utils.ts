// 声明chrome和browser全局变量类型
declare const chrome: any;
declare const browser: any;

// 判断当前环境是浏览器页面还是扩展
export function isExtensionEnvironment(): boolean {
  // 检查是否存在扩展特有的API
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return true;
  }
  
  // 检查是否存在扩展特有的存储API
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
    return true;
  }
  
  // 检查URL是否是扩展协议
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol;
    return protocol === 'chrome-extension:' || protocol === 'moz-extension:';
  }
  
  return false;
}

// 获取当前环境类型
export function getEnvironmentType(): 'browser' | 'extension' | 'node' {
  // 检查是否在Node.js环境
  if (typeof process !== 'undefined' && process.env && typeof window === 'undefined') {
    return 'node';
  }
  
  // 检查是否在扩展环境
  if (isExtensionEnvironment()) {
    return 'extension';
  }
  
  // 否则认为是浏览器页面环境
  return 'browser';
}

// 存储管理模块，兼容不支持localStorage的环境

// 内存存储对象，作为localStorage的备选
const memoryStorage: Record<string, string> = {};

// 检测localStorage是否可用
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    const testKey = '__test_local_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

// 统一的存储获取函数
export function getItem(key: string): string | null {
  try {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    }
    return memoryStorage[key] || null;
  } catch (e) {
    return memoryStorage[key] || null;
  }
}

// 统一的存储设置函数
export function setItem(key: string, value: string): void {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  } catch (e) {
    memoryStorage[key] = value;
  }
}

// 统一的存储移除函数
export function removeItem(key: string): void {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    } else {
      delete memoryStorage[key];
    }
  } catch (e) {
    delete memoryStorage[key];
  }
}

// 获取环境变量
export function getEnv(key: string): string | undefined {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // 忽略错误
  }
  return undefined;
}