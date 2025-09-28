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
    console.log('正在创建简单的演示页面截图...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.setContent(`
      <html>
        <head>
          <title>LLM Service Provider</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            h1 { color: #333; font-size: 32px; margin-bottom: 20px; }
            h2 { color: #555; font-size: 24px; margin-top: 30px; margin-bottom: 15px; }
            p { color: #666; line-height: 1.6; margin-bottom: 15px; }
            .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
            .feature { padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa; }
            .feature h3 { margin-top: 0; color: #444; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>LLM Service Provider</h1>
            <p>一站式AI服务集成平台，支持多种大语言模型提供商的API密钥管理和内容生成功能。</p>
            
            <h2>主要功能</h2>
            <div class="features">
              <div class="feature">
                <h3>多服务提供商支持</h3>
                <p>支持DeepSeek、Gemini、Groq、讯飞星火和YouChat等多种AI服务提供商</p>
              </div>
              <div class="feature">
                <h3>API密钥管理</h3>
                <p>安全管理各平台的API密钥，支持一键切换服务提供商</p>
              </div>
              <div class="feature">
                <h3>内容生成</h3>
                <p>基于主题和类别生成高质量内容，支持流式输出</p>
              </div>
              <div class="feature">
                <h3>思维导图创建</h3>
                <p>从生成内容自动创建结构化的思维导图</p>
              </div>
              <div class="feature">
                <h3>可视化展示</h3>
                <p>直观展示生成的思维导图，支持交互式操作</p>
              </div>
              <div class="feature">
                <h3>多语言支持</h3>
                <p>支持中文和英文界面切换，满足国际化需求</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
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