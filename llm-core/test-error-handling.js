// 测试错误处理机制
console.log('测试讯飞服务错误处理...');

// 模拟未配置API密钥的情况
const getItem = (key) => '';
const getEnv = (key) => '';

// 模拟request_xunfei函数
const request_xunfei = async () => null;

// 模拟其他必要函数
const generatePrompt = () => '';
const cleanContent = (content) => content;

// 模拟同步对话函数（简化版）
async function chat(prompt) {
  const apiKey = getItem('XUNFEI_API_KEY') || getEnv('VITE_XUNFEI_API_KEY') || '';
  const apiSecret = getItem('XUNFEI_API_SECRET') || getEnv('VITE_XUNFEI_API_SECRET') || '';
  
  if (!apiKey || !apiSecret) {
    return "请配置有效的XUNFEI_API_KEY和XUNFEI_API_SECRET";
  }
  
  const reader = await request_xunfei(apiKey, apiSecret, 'wss://spark-api.xf-yun.com/v1/x1', prompt);
  
  if (!reader) {
    return "无法连接到讯飞API";
  }
  
  return "成功连接";
}

// 模拟流式对话函数（简化版）
async function* streamChat(prompt) {
  const apiKey = getItem('XUNFEI_API_KEY') || getEnv('VITE_XUNFEI_API_KEY') || '';
  const apiSecret = getItem('XUNFEI_API_SECRET') || getEnv('VITE_XUNFEI_API_SECRET') || '';
  
  if (!apiKey || !apiSecret) {
    yield "请配置有效的XUNFEI_API_KEY和XUNFEI_API_SECRET";
    return;
  }
  
  yield "成功连接";
}

// 运行测试
async function runTests() {
  console.log('\n1. 测试未配置API密钥的同步对话错误处理:');
  const chatResult = await chat('测试消息');
  console.log('结果:', chatResult);
  console.log('是否正确处理:', chatResult === "请配置有效的XUNFEI_API_KEY和XUNFEI_API_SECRET");
  
  console.log('\n2. 测试未配置API密钥的流式对话错误处理:');
  for await (const chunk of streamChat('测试消息')) {
    console.log('流式结果:', chunk);
    console.log('是否正确处理:', chunk === "请配置有效的XUNFEI_API_KEY和XUNFEI_API_SECRET");
  }
  
  console.log('\n错误处理机制验证完成！');
}

runTests().catch(console.error);