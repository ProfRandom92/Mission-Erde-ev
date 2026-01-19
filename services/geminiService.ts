
import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { TriageResult, ChatMessage } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Compresses an image data URL to a max width/height to save bandwidth and improve latency.
 */
export const compressImage = async (dataUrl: string, maxDim: number = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  });
};

export const analyzeAnimal = async (base64Image: string): Promise<TriageResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `Du bist ein Lead AI Solutions Architect und Experte für Wildtier-Rettung im Stil von Mission Erde e.V.
Analysiere dieses Bild präzise.
1. Identifiziere die Spezies (Deutsch).
2. Bestimme die Kategorie: 'POLICE' für Jagdrecht (Reh, Wildschwein, Fuchs, etc.) oder 'SHELTER' für Naturschutz (Vogel, Igel, Eichhörnchen, etc.).
3. UNTERSUCHE DAS BILD AUF VERLETZUNGEN: Achte auf sichtbares Blut, Fehlstellungen von Gliedmaßen (Bruch), apathische Körperhaltung oder Anzeichen von Lethargie.
4. Gib in 'injury_details' eine kurze, fachliche Beschreibung der beobachteten Symptome/Verletzungen an.
5. Gib hochspezifische Erste-Hilfe-Hinweise basierend auf Spezies und Verletzung.
6. Suche 2-3 relevante Links zu Rettungsorganisationen.

Antworte NUR als striktes JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          { text: systemInstruction }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            species: { type: Type.STRING },
            category: { type: Type.STRING },
            advice: { type: Type.STRING },
            injury_details: { type: Type.STRING },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["title", "url"]
              },
            }
          },
          required: ["species", "category", "advice", "injury_details", "links"],
        },
      },
    });

    return JSON.parse(response.text.trim()) as TriageResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Fehler bei der Bild-Analyse.");
  }
};

export const createRescueAssistant = (history?: ChatMessage[]): Chat => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const sdkHistory = history?.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Du bist der "WildRetter Notfall-Assistent" von Mission Erde e.V.
      Wenn der Nutzer kein Foto machen kann, hilf ihm verbal.
      FRAGE GEZIELT NACH:
      - Aussehen des Tieres (Größe, Farbe, Besonderheiten)
      - Art der Verletzung (Blut, Humpeln, Apathie)
      - Standort (Wald, Straße, Garten)
      
      WICHTIG: Wenn du sicher bist, dass es ein Jagdtier (Reh, Wildschwein, Fuchs, Dachs, Hase, Marder) ist, füge am Ende deiner Antwort den Tag [CATEGORY:POLICE] hinzu.
      Wenn es ein Tier unter Naturschutz ist (Vogel, Igel, Eichhörnchen), füge den Tag [CATEGORY:SHELTER] hinzu.
      
      ZIEL:
      1. Identifiziere das Tier.
      2. Kläre: Jagdrecht (Polizei/Jäger) oder Naturschutz (Auffangstation).
      3. Gib sofortige Erste-Hilfe-Tipps.
      
      Antworte kurz, präzise und beruhigend. Nutze Emojis sparsam aber effektiv.`,
      history: sdkHistory,
    }
  });
};

export const generateSpeech = async (text: string): Promise<Uint8Array> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Lies ruhig und professionell vor für einen Ersthelfer vor Ort: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Keine Audio-Daten empfangen.");

  return decode(base64Audio);
};

// Helper functions for base64 decoding and PCM audio processing
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
