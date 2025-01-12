import { API_ENDPOINTS } from './config';
import { buildHeaders, buildRequestBody } from './requestBuilders';
import { parseResponse } from './responseParser';
import { LLMRequestParams, LLMResponse } from './types';

export async function executeLLM({ llm, prompt, model, apiKey, jsonSchema }: LLMRequestParams): Promise<LLMResponse> {
  if (!apiKey) {
    throw new Error(`${llm} API key is required`);
  }

  try {
    const endpoint = API_ENDPOINTS[llm];
    const systemPrompt = jsonSchema;

    const headers = buildHeaders(llm, apiKey);
    const body = buildRequestBody(llm, prompt, systemPrompt, model);

    console.log(`Making request to ${llm}...`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`${llm} API error:`, {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        `${llm} API error (${response.status}): ${
          errorData?.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    return parseResponse(llm, data);
  } catch (error) {
    console.error(`${llm} request failed:`, error);
    if (error instanceof Error) {
      throw new Error(`${llm} service error: ${error.message}`);
    }
    throw new Error(`${llm} service error: An unknown error occurred`);
  }
}