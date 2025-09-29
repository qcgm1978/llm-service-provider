const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot() {
  let browser;
  
  try {
    console.log('正在访问http://localhost:5174/并截取页面...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle0'
    });
    
    await delay(2000);
    
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
  }
}

takeScreenshot().then(() => {
  console.log('截图任务完成');
}).catch(() => {
  console.error('截图任务失败');
});