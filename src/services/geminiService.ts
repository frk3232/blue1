import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function predictTraffic(trafficData: any, localTime: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following traffic data for Kerala (Kochi/Trivandrum) at ${localTime}: ${JSON.stringify(trafficData)}`,
    config: {
      systemInstruction: "You are a Traffic Logistics Expert. Predict if the route will stay Green or turn Red within 30 minutes. Provide a recommendation text.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_predicted_jam: { type: Type.BOOLEAN },
          recommendation_text: { type: Type.STRING }
        },
        required: ["is_predicted_jam", "recommendation_text"]
      }
    }
  });

  return JSON.parse(response.text);
}
