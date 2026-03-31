import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getLLMClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY!,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });
  }
  return _client;
}
