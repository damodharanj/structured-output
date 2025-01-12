import { useState, useEffect } from 'react';
import { LLMProvider } from '../services/types';

export function useApiKey(selectedLLM: LLMProvider) {
  const storageKey = `llm-api-key-${selectedLLM}`;
  
  // Load API key from localStorage
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem(storageKey) || '';
    } catch (error) {
      console.error('Failed to load API key:', error);
      return '';
    }
  });

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    try {
      if (apiKey) {
        localStorage.setItem(storageKey, apiKey);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }, [apiKey, storageKey]);

  return [apiKey, setApiKey] as const;
}