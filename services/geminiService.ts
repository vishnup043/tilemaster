import { GoogleGenAI } from "@google/genai";
import { StockType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateMarketingDescription = async (
  name: string,
  type: StockType,
  size: string
): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning placeholder description.");
    return `Premium ${type} tile (${size}), perfect for modern interiors.`;
  }

  try {
    const prompt = `Write a short, compelling, high-end marketing description (max 2 sentences) for a tile product.
    Product Name: ${name}
    Material Type: ${type}
    Size: ${size}
    Tone: Professional, luxurious, architectural.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const generateBusinessInsight = async (
  totalStockValue: number,
  stockCount: number,
  topCategory: string
): Promise<string> => {
    if (!apiKey) return "Insights unavailable without API Key.";

    try {
        const prompt = `You are a business analyst for a tile company.
        Current Stats:
        - Total Stock Value: $${totalStockValue}
        - Total Unique Items: ${stockCount}
        - Most Popular Category: ${topCategory}

        Give me one brief, actionable tip (1 sentence) to optimize inventory or sales based on this snapshot.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Keep monitoring your stock levels.";
    } catch (e) {
        return "Could not generate insights.";
    }
}
