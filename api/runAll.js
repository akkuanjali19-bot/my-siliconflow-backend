import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS headers to allow frontend requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const client = new OpenAI({
      baseURL: "https://api.siliconflow.cn/v1",
      apiKey: process.env.SILICONFLOW_API_KEY
    });

    const { textInput, imageUrl, imagePrompt } = req.body;

    // 1️⃣ Image Understanding (Qwen2-VL)
    const visionRes = await client.chat.completions.create({
      model: "Qwen/Qwen2-VL-2B-Instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: textInput || "Describe this image" },
            imageUrl ? { type: "image_url", image_url: imageUrl } : null
          ].filter(Boolean)
        }
      ]
    });
    const visionText = visionRes.choices[0].message.content;

    // 2️⃣ Text Generation (DeepSeek / Qwen)
    const textRes = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V2.5",
      messages: [
        { role: "user", content: `Based on this description, write a short story: ${visionText}` }
      ]
    });
    const generatedText = textRes.choices[0].message.content;

    // 3️⃣ Image Generation (PixArt / FLUX)
    const imageRes = await client.images.generate({
      model: "black-forest-labs/FLUX.1-schnell",
      prompt: imagePrompt || generatedText
    });
    const imageUrlResult = imageRes.data?.[0]?.url || null;

    res.status(200).json({
      visionText,
      generatedText,
      imageUrl: imageUrlResult
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
