
import { GoogleGenAI, Type } from "@google/genai";
import { TaskExtractionResponse } from "../types.ts";

export const extractTasks = async (userInput: string): Promise<TaskExtractionResponse> => {
  // Use process.env.API_KEY directly for initialization as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userInput,
    config: {
      systemInstruction: `You are a task extraction system for teachers. 
      Your job is to convert messy, chaotic thoughts into clear daily tasks.
      Input may have no punctuation, no clear separation, and mixed ideas.
      
      RULES:
      1. Extract only explicit tasks mentioned. Split messy strings into individual tasks (e.g. "grade exams call parents" -> 2 tasks).
      2. Do not infer hidden tasks. Do not add new ones.
      3. Extract time if mentioned. If not, use "no fixed time".
      4. Importance: Use "high", "medium", or "low". If not stated, use "medium".
      5. Ignore filler words and repetition.
      6. No motivation, no opinions, no explanations.
      7. Strictly return JSON according to the schema.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                time: { type: Type.STRING },
                importance: { type: Type.STRING }
              },
              required: ["description", "time", "importance"]
            }
          }
        },
        required: ["tasks"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) return { tasks: [] };
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return { tasks: [] };
  }
};
