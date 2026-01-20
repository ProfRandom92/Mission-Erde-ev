import { GoogleGenAI, Type, Chat, Modality } from '@google/genai';
import { TriageResult, ChatMessage } from '../types';
import { API_CONFIG, IMAGE_CONFIG, AUDIO_CONFIG } from '../config/constants';
import { withRetry } from '../utils/retry';

const API_KEY = process.env['API_KEY'] || '';

if (!API_KEY) {
  console.warn('⚠️ Gemini API Key is missing. Please set GEMINI_API_KEY in your environment.');
}

/**
 * Compresses an image data URL to a max width/height to save bandwidth and improve latency.
 * Optimized with better error handling and progressive quality reduction.
 */
export const compressImage = async (
  dataUrl: string,
  maxDim: number = IMAGE_CONFIG.MAX_DIMENSION
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate aspect ratio preserving dimensions
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d', {
            alpha: false,
            willReadFrequently: false,
          });

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Use better image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Try to compress, fallback to lower quality if needed
          let compressed = canvas.toDataURL('image/jpeg', IMAGE_CONFIG.JPEG_QUALITY);

          // If compressed image is still too large (>1MB), reduce quality further
          if (compressed.length > 1024 * 1024) {
            compressed = canvas.toDataURL('image/jpeg', 0.6);
          }

          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };

      img.src = dataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

export const analyzeAnimal = async (base64Image: string): Promise<TriageResult> => {
  if (!API_KEY) {
    throw new Error('API Key ist nicht konfiguriert. Bitte kontaktiere den Support.');
  }

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

  const performAnalysis = async (): Promise<TriageResult> => {
    const response = await ai.models.generateContent({
      model: API_CONFIG.GEMINI_MODEL_ANALYSIS,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          { text: systemInstruction },
        ],
      },
      config: {
        responseMimeType: 'application/json',
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
                  url: { type: Type.STRING },
                },
                required: ['title', 'url'],
              },
            },
          },
          required: ['species', 'category', 'advice', 'injury_details', 'links'],
        },
      },
    });

    if (!response.text) {
      throw new Error('Keine Antwort vom KI-Service erhalten');
    }

    return JSON.parse(response.text.trim()) as TriageResult;
  };

  try {
    return await withRetry(performAnalysis, {
      maxRetries: API_CONFIG.MAX_RETRIES,
      delayMs: API_CONFIG.RETRY_DELAY_MS,
      onRetry: (attempt, error) => {
        console.warn(`Analyse-Versuch ${attempt} fehlgeschlagen:`, error.message);
      },
    });
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    const message =
      error instanceof Error ? error.message : 'Unbekannter Fehler bei der Bild-Analyse';
    throw new Error(`Fehler bei der Bild-Analyse: ${message}`);
  }
};

export const createRescueAssistant = (history?: ChatMessage[]): Chat => {
  if (!API_KEY) {
    throw new Error('API Key ist nicht konfiguriert');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const sdkHistory = history?.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const chatConfig: any = {
    model: API_CONFIG.GEMINI_MODEL_CHAT,
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
    },
  };

  if (sdkHistory && sdkHistory.length > 0) {
    chatConfig.config.history = sdkHistory;
  }

  return ai.chats.create(chatConfig);
};

export const generateSpeech = async (text: string): Promise<Uint8Array> => {
  if (!API_KEY) {
    throw new Error('API Key ist nicht konfiguriert');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const performSpeechGeneration = async (): Promise<Uint8Array> => {
    const response = await ai.models.generateContent({
      model: API_CONFIG.GEMINI_MODEL_TTS,
      contents: [
        {
          parts: [
            {
              text: `Lies ruhig und professionell vor für einen Ersthelfer vor Ort: ${text}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: AUDIO_CONFIG.VOICE_NAME },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('Keine Audio-Daten empfangen.');
    }

    return decode(base64Audio);
  };

  try {
    return await withRetry(performSpeechGeneration, {
      maxRetries: 2,
      delayMs: 500,
      onRetry: (attempt, error) => {
        console.warn(`TTS-Versuch ${attempt} fehlgeschlagen:`, error.message);
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    throw new Error('Sprachausgabe fehlgeschlagen. Bitte versuche es erneut.');
  }
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
  sampleRate: number = AUDIO_CONFIG.SAMPLE_RATE,
  numChannels: number = AUDIO_CONFIG.NUM_CHANNELS
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = Math.floor(dataInt16.length / numChannels);
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      const index = i * numChannels + channel;
      const value = dataInt16[index];
      if (value !== undefined) {
        channelData[i] = value / 32768.0;
      }
    }
  }
  return buffer;
}
