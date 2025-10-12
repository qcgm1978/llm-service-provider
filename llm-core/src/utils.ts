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