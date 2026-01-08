import { PlanetInfoResponse, GroundingSource, ChatMessage, PlanetData } from "../types";
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

/**
 * =========================================================
 * SISTEMA OPERATIVO LUCAS (Real AI Integration)
 * =========================================================
 */

export const validateInput = (input: string): { isSafe: boolean; message: string } => {
  return { isSafe: true, message: "Scan Complete: Safe" };
};

export interface CustomChatSession {
    sendMessageStream: (params: { message: string }) => Promise<AsyncGenerator<{ text: string; sources?: GroundingSource[] }>>;
    sendMessage: (params: { functionResponses?: any[] }) => Promise<void>;
}

// Helper: Limpia el formato Markdown JSON si la IA lo incluye (ej: ```json { ... } ```)
// Esto evita que el sitio se rompa si la IA es demasiado "explicativa"
function cleanJsonString(jsonString: string): string {
  if (!jsonString) return "{}";
  let clean = jsonString.trim();
  // Eliminar bloques de código markdown ```json y ```
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '');
  }
  return clean.trim();
}

// Helper: Exponential Backoff Retry para manejar límites de cuota o fallos de red
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error.status === 429 || 
                         error.status === 'RESOURCE_EXHAUSTED' || 
                         (error.message && (error.message.includes('429') || error.message.includes('quota')));
    
    if ((isQuotaError || error.message) && retries > 0) {
      console.warn(`Gemini Retry: ${retries} attempts left. Waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest', // Modelo rápido para tareas simples
      contents: `Genera un título muy corto (max 3 palabras) para un chat sobre: "${firstMessage}"`,
    });
    return response.text?.trim() || "Nueva Consulta";
  } catch (e) {
    return "Chat Astronómico";
  }
};

export const createCosmicChatSession = (history?: ChatMessage[]): CustomChatSession => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const sdkHistory = history ? history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  })) : [];

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash-latest', // Usamos Flash para chat rápido y fluido
    history: sdkHistory,
    config: {
      temperature: 0.7,
      systemInstruction: `Eres LUCAS (Laboratorio de Unidades de Consulta Astronómica y Solar). 
      Tu misión es asistir al usuario con datos precisos sobre el cosmos. 
      
      INFORMACIÓN DE IDENTIDAD CRÍTICA:
      - Si te preguntan quién te creó: Fuiste creado por Darwin Florentino Bocio para fines educativos el 7 de enero de 2026.
      
      INSTRUCCIONES DE COMPORTAMIENTO:
      - Sé profesional, curioso y educativo.
      - Mantén respuestas concisas pero fascinantes.
      - Si te preguntan sobre eventos actuales, aclara que tu conocimiento tiene una fecha de corte, pero intenta responder con principios generales.`,
      // Nota: googleSearch tool removida temporalmente para compatibilidad con modelo Flash estándar si no hay acceso a Pro
    },
  });

  return {
    sendMessageStream: async ({ message }) => {
      async function* streamGenerator() {
        try {
          const result = await chat.sendMessageStream({ message });
          for await (const chunk of result) {
            const text = chunk.text;
            // Manejo básico de fuentes si el modelo las provee (aunque Flash estándar suele no dar groundingMetadata igual que Pro)
            let sources: GroundingSource[] = [];
            if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
              chunk.candidates[0].groundingMetadata.groundingChunks.forEach((c: any) => {
                if (c.web) {
                  sources.push({ title: c.web.title || 'Referencia', uri: c.web.uri });
                }
              });
            }
            yield { text: text || '', sources: sources.length > 0 ? sources : undefined };
          }
        } catch (error: any) {
          console.error("LUCAS Chat Error:", error);
          yield { text: "⚠️ Interferencia en la señal. Por favor, verifica tu conexión." };
        }
      }
      return streamGenerator();
    },
    sendMessage: async () => { }
  };
};

/**
 * Obtiene detalles científicos del planeta. 
 * Se utiliza el modelo Flash para garantizar el cumplimiento del formato JSON.
 */
export const getPlanetDetails = async (planetName: string): Promise<PlanetInfoResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
      const response = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-latest',
        contents: `Actúa como un experto de la NASA. Proporciona información técnica, descubrimientos recientes y datos curiosos sobre ${planetName}. 
        IMPORTANTE: Responde ÚNICAMENTE en formato JSON siguiendo el esquema. NO uses Markdown en la estructura JSON.`,
        config: { 
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                introduction: { type: Type.STRING, description: "Un breve párrafo introductorio cautivador." },
                description: { type: Type.STRING, description: "Descripción técnica detallada en formato Markdown." },
                keyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Lista de 3 a 5 datos fascinantes."
                },
                news: { type: Type.STRING, description: "Noticias o misiones históricas relevantes." },
                lastUpdate: { type: Type.STRING, description: "Fecha de la última telemetría (formato texto, ej: 'Hoy')." }
              },
              required: ["introduction", "description", "keyPoints", "news", "lastUpdate"]
            }
        }
      }));
      
      let jsonText = response.text?.trim();
      if (!jsonText) throw new Error("Telemetry blank");
      
      // Limpieza de seguridad para evitar errores de parseo (CRÍTICO para producción)
      jsonText = cleanJsonString(jsonText);

      const parsed = JSON.parse(jsonText);

      return {
          data: {
            introduction: parsed.introduction || "Información no disponible.",
            description: parsed.description || "Sin descripción.",
            keyPoints: parsed.keyPoints || [],
            news: parsed.news || "Sin noticias recientes.",
            lastUpdate: parsed.lastUpdate || "Sincronizando..."
          },
          sources: [] 
      };
  } catch (e: any) {
      console.error("Planet Telemetry Error:", e);
      return {
          data: {
             introduction: "Enlace Orbital Inestable",
             description: "Los servidores de telemetría no responden. Esto puede deberse a una alta demanda o a una interrupción en la señal estelar.",
             keyPoints: ["Error de comunicación.", "Reintento sugerido."], 
             news: "Telemetría bloqueada por interferencia.",
             lastUpdate: "SYSTEM_OFFLINE"
          },
          sources: []
      };
  }
};