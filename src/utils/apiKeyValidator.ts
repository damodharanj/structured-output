import { LLMProvider } from '../services/types';

export function validateApiKey(provider: LLMProvider, key: string): string | null {
  if (provider === 'Ollama') {
    return null; // Ollama doesn't require an API key when running locally
  }

  if (!key.trim()) {
    return 'API key is required';
  }

  switch (provider) {
    case 'OpenAI':
      if (!key.startsWith('sk-') || key.length < 40) {
        return 'Invalid OpenAI API key format. Key should start with "sk-" and be at least 40 characters';
      }
      break;
    // case 'Anthropic':
    //   if (!key.startsWith('sk-ant-')) {
    //     return 'Invalid Anthropic API key format. Key should start with "sk-ant-"';
    //   }
    //   break;
    // case 'Gemini':
    //   if (key.length < 20) {
    //     return 'Invalid Gemini API key format. Key should be at least 20 characters';
    //   }
    //   break;
  }

  return null;
}