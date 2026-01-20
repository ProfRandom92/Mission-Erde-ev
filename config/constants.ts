/**
 * Application-wide constants
 */

// GPS & Location
export const GPS_CONFIG = {
  HIGH_ACCURACY_THRESHOLD: 50, // meters
  LOCATION_DRIFT_THRESHOLD: 200, // meters
  WATCH_TIMEOUT: 5000, // ms
  MAX_AGE: 0,
} as const;

// Image Processing
export const IMAGE_CONFIG = {
  MAX_DIMENSION: 1024,
  JPEG_QUALITY: 0.8,
  ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'wildretter_rescue_chat_history',
  SUCCESS_COUNT: 'rescue_success_count',
} as const;

// API Configuration
export const API_CONFIG = {
  GEMINI_MODEL_ANALYSIS: 'gemini-3-pro-preview',
  GEMINI_MODEL_CHAT: 'gemini-3-flash-preview',
  GEMINI_MODEL_TTS: 'gemini-2.5-flash-preview-tts',
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  TIMEOUT_MS: 30000,
} as const;

// Audio Configuration
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 24000,
  NUM_CHANNELS: 1,
  VOICE_NAME: 'Kore',
} as const;

// Emergency Hotline
export const EMERGENCY_HOTLINE = '070034244677';

// Animation Durations (ms)
export const ANIMATION = {
  FADE_IN: 500,
  SLIDE_IN: 700,
  SUCCESS_REDIRECT: 4500,
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 13,
  TILE_LAYER: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  MAX_ZOOM: 20,
  MARKER_RADIUS: 12,
} as const;
