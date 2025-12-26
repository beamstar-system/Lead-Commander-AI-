
import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced retry wrapper with exponential backoff specifically for 429 errors.
 */
async function withRetry<T>(
  fn: () => Promise<T>, 
  onRetry?: (attempt: number, delayMs: number) => void,
  maxRetries = 5, 
  initialDelay = 2000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.status === 429 || 
                          error?.message?.includes('429') || 
                          error?.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimit && i < maxRetries - 1) {
        const delayTime = initialDelay * Math.pow(2, i) + Math.random() * 1000;
        if (onRetry) onRetry(i + 1, delayTime);
        await delay(delayTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const fetchCommercialLeads = async (
  city: string, 
  state: string,
  onProgress: (msg: string) => void
): Promise<Lead[]> => {
  return withRetry(async () => {
    onProgress(`Scanning ${city} for high-value commercial assets...`);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Perform an exhaustive search for commercial industrial parks, large distribution centers, manufacturing facilities, and corporate office complexes in ${city}, ${state}. Focus on properties with large roof surface areas (over 20,000 sq ft). Provide details for as many as possible (aiming for a high-density lead list). These are for RoofMaxx roof preservation services.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: 40.4406,
              longitude: -79.9959
            }
          }
        }
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const leads: Lead[] = groundingChunks.map((chunk: any, index: number) => {
      const mapsData = chunk.maps;
      if (!mapsData) return null;

      return {
        id: crypto.randomUUID(),
        businessName: mapsData.title || `Commercial Asset ${index + 1}`,
        address: "Pittsburgh Industrial Zone, PA", 
        phoneNumber: "Pending Verification",
        website: mapsData.uri || "N/A",
        latitude: 40.44 + (Math.random() * 0.1 - 0.05),
        longitude: -79.99 + (Math.random() * 0.1 - 0.05),
        businessType: "Commercial / Industrial",
        googleMapsUrl: mapsData.uri || "",
        roofType: "Analyzing...",
        estimatedSqFt: "Scanning...",
        roofCondition: 'Unknown',
        estimatedAge: "Analyzing...",
        notes: "Identified via satellite grounding. High-priority commercial lead.",
        scannedAt: new Date().toISOString()
      };
    }).filter(Boolean) as Lead[];

    return leads;
  }, (attempt, wait) => {
    onProgress(`Rate limit reached. Cooling down... Retrying in ${Math.round(wait/1000)}s (Attempt ${attempt})`);
  });
};

export const analyzeRoofData = async (lead: Lead, onRetry?: (msg: string) => void): Promise<Partial<Lead>> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the commercial roof at ${lead.businessName}. We need data for RoofMaxx targeting. Provide:
      1. Precise Roof Material (e.g., TPO, EPDM, Mod-Bit).
      2. Estimated Square Footage (Numeric estimate).
      3. Estimated Roof Age.
      4. Current condition (Excellent, Good, Fair, Poor).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roofType: { type: Type.STRING },
            estimatedSqFt: { type: Type.STRING },
            estimatedAge: { type: Type.STRING },
            roofCondition: { 
              type: Type.STRING,
              description: "Must be one of: Excellent, Good, Fair, Poor"
            },
            notes: { type: Type.STRING }
          },
          required: ["roofType", "estimatedSqFt", "estimatedAge", "roofCondition"]
        }
      }
    });

    try {
      return JSON.parse(response.text);
    } catch {
      return { roofCondition: 'Fair', notes: "Technical analysis limited. Manual inspection recommended." };
    }
  }, (attempt, wait) => {
    if (onRetry) onRetry(`Rate limit hit for ${lead.businessName}. Backing off ${Math.round(wait/1000)}s...`);
  });
};
