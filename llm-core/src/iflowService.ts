import { generatePrompt, StreamDefinitionOptions } from "./llmService";
import { getItem, setItem, removeItem } from "./utils";

const IFLOW_API_URL = "https://apis.iflow.cn/v1/chat/completions";
const IFLOW_MODEL = "tstars2.0";
// 确保使用一致的键名常量
const IFLOW_API_KEY_STORAGE_KEY = "IFLOW_API_KEY";

// 获取API密钥
function getApiKey(): string | undefined {
  // 添加调试日志
  const key = getItem(IFLOW_API_KEY_STORAGE_KEY);
  console.log("获取心流API密钥:", key ? "已存在" : "不存在");
  return key || undefined;
}

// 注意：这个函数会被llmService.ts中的同名函数调用
export function setIflowApiKey(apiKey: string): void {
  // 添加调试日志
  console.log("设置心流API密钥:", apiKey ? "已设置" : "已清除");
  if (apiKey) {
    setItem(IFLOW_API_KEY_STORAGE_KEY, apiKey);
    // 额外验证是否保存成功
    const savedKey = getItem(IFLOW_API_KEY_STORAGE_KEY);
    console.log("心流API密钥保存结果:", savedKey ? "成功" : "失败");
  } else {
    removeItem(IFLOW_API_KEY_STORAGE_KEY);
  }
}

// 移除本地的hasIflowApiKey函数，避免与llmService.ts中的函数冲突
// 直接使用getApiKey()进行检查

// 配置默认参数
const defaultConfig = {
  model: IFLOW_MODEL,
  temperature: 0.7,
  top_p: 0.7,
  top_k: 50,
  max_tokens: 2048,
  frequency_penalty: 0.0,
  stream: true,
};

// 修复streamDefinition函数，恢复正确的异步生成器接口
export async function*
streamDefinition(options: StreamDefinitionOptions): AsyncGenerator<string, void, undefined> {
  const { topic, language = "zh", category, context } = options;
  const apiKey = getApiKey();
  console.log("streamDefinition中获取API密钥:", apiKey ? "已获取" : "未获取");

  // 也检查localStorage直接值
  const localStorageKey = localStorage.getItem(IFLOW_API_KEY_STORAGE_KEY);
  console.log(
    "直接从localStorage获取API密钥:",
    localStorageKey ? "已存在" : "不存在"
  );

  if (!apiKey) {
    console.error("API密钥缺失，抛出错误");
    const errorMsg =
      language === "zh"
        ? "Error: 心流API密钥未配置。请在设置中配置您的API密钥以继续。"
        : "Error: iFlow API key is not configured. Please configure your API key in the settings to continue.";
    yield errorMsg;
    return;
  }

  const prompt = generatePrompt(topic, language, context);
  const messages = [{ role: "user", content: prompt }];
  const config = {
    ...defaultConfig,
    messages,
  };

  try {
    const response = await fetch(IFLOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(config),
    });

    console.log("API请求已发送，状态码:", response.status);

    if (!response.ok) {
      const errorMsg =
        language === "zh"
          ? `Error: 请求失败 (${response.status})`
          : `Error: Request failed (${response.status})`;
      yield errorMsg;
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      const errorMsg =
        language === "zh"
          ? "Error: 无法获取响应流"
          : "Error: Unable to get response stream";
      yield errorMsg;
      return;
    }

    const decoder = new TextDecoder();
    let accumulatedText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;

      const lines = accumulatedText.split("\n");
      accumulatedText = lines.pop() || "";
      let parsedText: any;
      try {
        parsedText = JSON.parse(accumulatedText);
        if (parsedText.status !== 200) {
          const errorMsg =
            language === "zh"
              ? `Error: 请求失败 (${parsedText.msg})`
              : `Error: Request failed (${parsedText.msg})`;
          yield errorMsg;
          return;
        }
      } catch {}
      for (const line of lines) {
        if (line.trim() === "") continue;
        if (line.startsWith(":")) continue;

        try {
          if (line.startsWith("data:")) {
            const data = line.substring(5);
            if (data === "[DONE]") {
              continue;
            }
            const parsed = JSON.parse(data);
            if (parsed.choices && parsed.choices[0]?.delta?.content) {
              yield parsed.choices[0].delta.content;
            }
          }
        } catch (error) {
          console.error("解析心流响应失败:", error, line);
        }
      }
    }
  } catch (error) {
    const errorMsg =
      language === "zh"
        ? "Error: 网络请求失败"
        : "Error: Network request failed";
    yield errorMsg;
  }
}
