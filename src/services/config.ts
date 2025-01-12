import { LLMProvider } from './types';

export const API_ENDPOINTS: Record<LLMProvider, string> = {
  OpenAI: 'https://api.openai.com/v1/chat/completions',
  // Anthropic: 'https://api.anthropic.com/v1/messages',
  // Gemini: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
  Ollama: 'http://localhost:11434/api/generate' // Local Ollama endpoint
};