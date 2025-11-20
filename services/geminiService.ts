import { GoogleGenAI, Type } from "@google/genai";
import { GameInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGameManual = async (filename: string): Promise<GameInfo> => {
  const model = "gemini-2.5-flash";
  
  // Clean filename to get game title (e.g., "Super Mario Bros (USA).nes" -> "Super Mario Bros")
  const gameTitle = filename.replace(/\.nes$/i, '').replace(/\(.*\)/, '').trim();

  const prompt = `
    Provide a retro-style game manual summary for the NES game "${gameTitle}".
    Include a nostalgic description, release year, genre, 3 fun facts, and a mapping of standard NES controls (A, B, Start, Select, D-Pad) to what they usually do in this specific game.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            releaseDate: { type: Type.STRING },
            genre: { type: Type.STRING },
            funFacts: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            controls: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  key: { type: Type.STRING, description: "The NES button (A, B, Start, etc.)" }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GameInfo;
    }
    throw new Error("No data returned from Gemini");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback data
    return {
      title: gameTitle,
      description: "Could not retrieve game data. Enjoy the retro experience!",
      releaseDate: "Unknown",
      genre: "Retro",
      funFacts: ["Blow on the cartridge if it doesn't work!", "This emulator runs entirely in your browser."],
      controls: []
    };
  }
};