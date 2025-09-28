const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

// 转换exec为Promise
const execPromise = util.promisify(exec);

// 等待一段时间的函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot() {
  let devServer;
  let browser;

  try {
    console.log('开始构建demo应用...');
    await execPromise('cd demo && npm install && npm run build');
    
    console.log('启动demo预览服务器...');
    devServer = exec('cd demo && npm run preview');
    
    // 等待服务器启动
    await delay(5000);
    
    console.log('启动浏览器并访问demo应用...');
    browser = await puppeteer.launch({
      headless: true, // 无头模式运行
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 }); // 设置视图大小
    
    // 访问demo预览服务器
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
    
    // 等待页面完全加载
    await delay(3000);
    
    console.log('正在截取页面截图...');
    const screenshotPath = path.join(__dirname, 'llm.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`截图已保存至: ${screenshotPath}`);
    
  } catch (error) {
    console.error('截图过程中发生错误:', error);
    throw error;
  } finally {
    // 关闭浏览器
    if (browser) {
      await browser.close();
    }
    
    // 关闭服务器
    if (devServer) {
      devServer.kill();
    }
  }
}

// 执行截图函数
if (require.main === module) {
  takeScreenshot().then(() => {
    console.log('截图任务完成');
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

module.exports = { takeScreenshot };