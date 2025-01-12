import { LLMProvider } from './types';

export function buildHeaders(llm: LLMProvider, apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (llm) {
    case 'OpenAI':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'Ollama':
      // No headers needed for local Ollama
      break;
  }

  return headers;
}

export function buildRequestBody(llm: LLMProvider, prompt: string, systemPrompt: any, model: string) {
  switch (llm) {
    case 'OpenAI':
      const openAIRequest: any = {
        model: model || 'gpt-3.5-turbo', // Provide default model as fallback
        messages: [
          // { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      }
      if (systemPrompt) {
        openAIRequest.response_format = {
          "type": "json_schema",
          "json_schema": {
            "name": "process_steps",
            "strict": true,
            "schema": systemPrompt
          }
        }
      }
      return openAIRequest;
    // case 'Anthropic':
    //   return {
    //     model: model || 'claude-2',
    //     messages: [
    //       { role: 'user', content: `${systemPrompt}\n\n${prompt}` }
    //     ]
    //   };
    // case 'Gemini':
    //   return {
    //     model: model || 'gemini-pro',
    //     contents: [{
    //       parts: [{ text: `${systemPrompt}\n\n${prompt}` }]
    //     }]
    //   };
    case 'Ollama':
      const request: any = {
        model: model || 'llama2',
        prompt: `${systemPrompt}\n\n${prompt}`,
        stream: false,
      };
      if (systemPrompt) {
        request.format = systemPrompt
      }
      return request;
  }
}