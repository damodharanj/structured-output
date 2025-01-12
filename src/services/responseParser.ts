import { LLMProvider, LLMResponse } from './types';

export function parseResponse(llm: LLMProvider, data: any): LLMResponse {
  try {
    const output = extractContent(llm, data);
    return { output, raw: data };
  } catch (error) {
    throw new Error(`Failed to parse ${llm} response: ${error.message}`);
  }
}

function extractContent(llm: LLMProvider, data: any): string {
  switch (llm) {
    case 'OpenAI':
      return data.choices?.[0]?.message?.content ?? '';
    case 'Anthropic':
      return data.content?.[0]?.text ?? '';
    case 'Gemini':
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    case 'Ollama':
      return data.response ?? '';
    default:
      return '';
  }
}