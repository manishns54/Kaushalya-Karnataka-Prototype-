import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function generateWorkerBio(services: { name: string, description?: string }[], locality: string, name: string) {
  const serviceList = services.map(s => `- ${s.name}: ${s.description || 'General'}`).join('\n');
  
  const prompt = `
    You are an expert copywriter for a service marketplace.
    Generate a short, professional, and friendly bio for a worker.
    
    Worker Name: ${name}
    Locality: ${locality}
    Services Offered:
    ${serviceList}
    
    The bio should be exactly 2-3 sentences. 
    Focus on trustworthiness and expertise.
    Start with "Hi, I'm ${name.split(' ')[0]}...".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "I'm a professional service provider dedicated to quality work.";
  } catch (error) {
    console.error("AI Generation failed:", error);
    return "I'm a dedicated professional providing high-quality services in my local area.";
  }
}
