import CryptoJS from 'crypto-js';

class XunfeiWebSocketParams {
  APIKey: string;
  APISecret: string;
  host: string;
  path: string;
  gpt_url: string;
  prompt: string;

  constructor(
    APIKey: string,
    APISecret: string,
    gpt_url: string,
    prompt: string
  ) {
    this.APIKey = APIKey;
    this.APISecret = APISecret;
    const parsedUrl = new URL(gpt_url);
    this.host = parsedUrl.host;
    this.path = parsedUrl.pathname + parsedUrl.search;
    this.gpt_url = gpt_url;
    this.prompt = prompt;
  }

  async create_url() {
    const now = new Date();
    const date = this.format_date_time(now);

    const signature_origin = `host: ${this.host}\ndate: ${date}\nGET ${this.path} HTTP/1.1`;

    const signature_sha = await this.generateHmac(
      this.APISecret,
      signature_origin
    );
    if (!signature_sha) {
      return null;
    }
    const signature_sha_base64 = btoa(
      String.fromCharCode(...new Uint8Array(signature_sha))
    );

    const authorization_origin = `api_key="${this.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature_sha_base64}"`;
    const authorization = btoa(authorization_origin);

    const v = {
      authorization: authorization,
      date: date,
      host: this.host,
    };

    const queryString = new URLSearchParams(v).toString();
    const wsUrl = `${this.gpt_url}?${queryString}`;
    return wsUrl;
  }

  async generateHmac(key: string, data: string): Promise<ArrayBuffer | null> {
    try {
      // 使用crypto-js库生成HMAC-SHA256
      const hmac = CryptoJS.HmacSHA256(data, key);
      const hmacHex = hmac.toString(CryptoJS.enc.Hex);
      
      // 将Hex字符串转换为ArrayBuffer
      const buffer = new ArrayBuffer(hmacHex.length / 2);
      const view = new Uint8Array(buffer);
      
      for (let i = 0; i < hmacHex.length; i += 2) {
        view[i / 2] = parseInt(hmacHex.substr(i, 2), 16);
      }
      
      return buffer;
    } catch (error) {
      console.log("Error generating HMAC:", error);
      return null;
    }
  }

  format_date_time(date: Date): string {
    return date.toUTCString();
  }
}

function on_error(error: Event) {
  console.log("### error:", error);
}

function on_close(close_status_code: number, close_msg: string) {
  console.log("### closed ###");
}

function on_open(ws: WebSocket, prompt: string) {
  const data = JSON.stringify({
    payload: {
      message: {
        text: [
          {
            role: "system",
            content: "",
          },
          {
            role: "user",
            content: prompt || "请在此处输入你的问题!!!",
          },
        ],
      },
    },
    parameter: {
      chat: {
        max_tokens: 32768,
        domain: "x1",
        top_k: 6,
        temperature: 1.2,
        tools: [
          {
            web_search: {
              search_mode: "normal",
              enable: false,
            },
            type: "web_search",
          },
        ],
      },
    },
    header: {
      app_id: "7802f8ba",
    },
  });
  ws.send(data);
}

export default async function request_xunfei(
  api_secret: string,
  api_key: string,
  gpt_url: string,
  prompt: string
): Promise<ReadableStreamDefaultReader<Uint8Array> | null> {
  try {
    const wsParam = new XunfeiWebSocketParams(
      api_key,
      api_secret,
      gpt_url,
      prompt
    );
    const wsUrl = await wsParam.create_url();

    if (!wsUrl) {
      return null;
    }

    const ws = new WebSocket(wsUrl);
    let webSocketError: Error | null = null;

    ws.onopen = () => on_open(ws, wsParam.prompt);
    ws.onerror = on_error;
    ws.onclose = (event) => on_close(event.code, event.reason);

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    ws.onmessage = (event) => {
      try {
        const data = event.data;
        const message = JSON.parse(data);
        if (message.payload?.choices?.text?.[0]?.content) {
          const content = message.payload.choices.text[0].content;
          writer.write(
            encoder.encode(
              `data: ${JSON.stringify({ 
                choices: [{ delta: { content } }], 
              })}\n\n`
            )
          );
        }
        if (message.header?.code !== 0) {
          writer.close();
          ws.close();
        }
        if (message.payload?.choices?.status === 2) {
          writer.write(encoder.encode("data: [DONE]\n\n"));
          writer.close();
          ws.close();
        }
      } catch (e) {
        console.error("Error processing message:", e);
      }
    };

    ws.onerror = (error) => {
      writer.close();
      let errorInfo = 'Unknown WebSocket error';
      if (error instanceof Error) {
        errorInfo = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const eventError = error as Event;
        const errorDetails = {
          type: eventError.type || 'unknown',
          target: eventError.target ? 'WebSocket connection' : 'unknown target',
          readyState: ws.readyState,
          url: ws.url,
        };
        errorInfo = JSON.stringify(errorDetails);
      } else {
        errorInfo = String(error);
      }
      webSocketError = new Error(`WebSocket error: ${errorInfo}`);
    };

    await new Promise<void>((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (webSocketError) {
          clearInterval(checkInterval);
          reject(webSocketError);
        }
        if (ws.readyState === WebSocket.OPEN) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    });

    return readable.getReader();
  } catch (error) {
    console.error("Error in request_xunfei:", error);
    throw error;
  }
}

export { request_xunfei, XunfeiWebSocketParams };
