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

    const { prompt } = req.body;

    const response = await client.images.generate({
      model: "black-forest-labs/FLUX.1-schnell",
      prompt
    });

    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
