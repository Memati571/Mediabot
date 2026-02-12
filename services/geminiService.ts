
import { GoogleGenAI, Type } from "@google/genai";
import { VideoMetadata, VideoPlatform } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gemini API orqali video havolasini "ko'rib" chiqish
 */
export const fetchVideoMetadataWithAI = async (url: string): Promise<VideoMetadata> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Ushbu YouTube yoki Instagram havolasini internetdan qidirib, uning haqiqiy metadata ma'lumotlarini top: ${url}. 
      Menga quyidagilar JSON formatida kerak: 
      1. Videoning aniq sarlavhasi (title)
      2. Kanal yoki profil nomi (author)
      3. Platforma nomi
      4. Videoda nima haqida gap ketayotgani haqida qisqa (10-15 so'z) tushuntirish (summary).`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            platform: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ["title", "author", "platform", "summary"],
        },
      },
    });

    const data = JSON.parse(response.text);
    const platform = data.platform.toUpperCase().includes('YOUTUBE') ? VideoPlatform.YOUTUBE : VideoPlatform.INSTAGRAM;
    const id = Math.random().toString(36).substring(7);

    // YouTube bo'lsa haqiqiy thumbnailni yasash
    let thumbnail = `https://picsum.photos/seed/${id}/640/360`;
    if (platform === VideoPlatform.YOUTUBE) {
      const ytMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
      if (ytMatch) thumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    } else {
      thumbnail = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=640";
    }

    return {
      id,
      url,
      platform,
      title: data.title || "Sarlavhasiz video",
      author: data.author || "Noma'lum muallif",
      thumbnail,
      duration: "HD 1080p",
      aiSummary: data.summary,
    };
  } catch (error) {
    console.error("AI Metadata error:", error);
    return fallbackParser(url);
  }
};

const fallbackParser = (url: string): VideoMetadata => {
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  return {
    id: Math.random().toString(36).substring(7),
    url,
    platform: isYoutube ? VideoPlatform.YOUTUBE : VideoPlatform.INSTAGRAM,
    title: "Video tahlil qilinmoqda...",
    author: "Yuklovchi",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=640",
    duration: "HD",
    aiSummary: "Tizim videoni yuklashga tayyorlamoqda.",
  };
};
