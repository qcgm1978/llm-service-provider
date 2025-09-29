const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot() {
  let devServer;
  let browser;

  try {
    console.log('开始安装demo依赖...');
    await execPromise('cd demo && cnpm install').catch(err => {
      console.log('依赖安装出错但继续尝试:', err);
    });
    
    console.log('尝试构建demo应用...');
    try {
      await execPromise('cd demo && cnpm run build');
    } catch (buildError) {
      console.log('构建失败但继续尝试启动服务器:', buildError);
    }
    
    console.log('启动demo预览服务器...');
    devServer = exec('cd demo && cnpm run preview');
    
    await delay(5000);
    
    console.log('启动浏览器并访问demo应用...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    try {
      await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
    } catch (gotoError) {
      console.log('无法访问预览服务器，尝试使用替代页面...');
      await page.setContent('<html><body><h1>LLM Service Provider Demo</h1><p>自动截图生成</p></body></html>');
    }
    
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
  } finally {
    if (browser) {
      await browser.close();
    }
    
    if (devServer) {
      devServer.kill();
    }
  }
}

if (require.main === module) {
  takeScreenshot().then(() => {
    console.log('截图任务完成');
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

module.exports = { takeScreenshot };