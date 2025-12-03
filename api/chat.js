import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const client = new OpenAI({
      baseURL: "https://api.siliconflow.cn/v1",
      apiKey: process.env.SILICONFLOW_API_KEY
    });

    const { messages, model } = req.body;

    const response = await client.chat.completions.create({
      model: model || "deepseek-ai/DeepSeek-V2.5",
      messages
    });

    res.status(200).json(response.choices[0].message);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
