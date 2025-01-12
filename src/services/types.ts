
export const llmOptions = ['OpenAI', 'Ollama'] as const;

// export const llmOptions = ['OpenAI'
//   // , 'Anthropic', 'Gemini', 'Ollama'
// ]  as const;
export type LLMProvider = typeof llmOptions[number];



export const modelsByProvider = {
  OpenAI: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'] as const,
  Anthropic: ['claude-2.1', 'claude-instant'] as const,
  Gemini: ['gemini-pro'] as const,
  Ollama: ['llama2', 'mistral', 'codellama'] as const,
} as const;

export type LLMModel = typeof modelsByProvider[keyof typeof modelsByProvider][number];

export interface LLMResponse {
  output: string;
  raw: any;
}

export interface LLMRequestParams {
  llm: LLMProvider;
  model: LLMModel;
  prompt: string;
  apiKey: string;
  jsonSchema?: string;
}