const url = "https://apis.iflow.cn/v1/chat/completions";
const payload = {
  model: "tstars2.0",
  messages: [
    { role: "user", content: "中国大模型行业2025年将会迎来哪些机遇和挑战？" },
  ],
  stream: false,
  max_tokens: 512,
  stop: ["null"],
  temperature: 0.7,
  top_p: 0.7,
  top_k: 50,
  frequency_penalty: 0.5,
  n: 1,
  response_format: { type: "text" },
  tools: [
    {
      type: "function",
      function: {
        description: "<string>",
        name: "<string>",
        parameters: {},
        strict: false,
      },
    },
  ],
};
const headers = {
  Authorization: "Bearer <XinLiu API KEY>",
  "Content-Type": "application/json",
};
fetch(url, { method: "POST", headers: headers, body: JSON.stringify(payload) })
  .then((response) => response.json())
  .then((data) => console.log(data));
