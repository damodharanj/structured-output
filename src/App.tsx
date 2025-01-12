import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { SettingsModal } from './components/SettingsModal';
import { useApiKey } from './hooks/useApiKey';
import { executeLLM } from './services/llmService';
import { LLMProvider, LLMModel } from './services/types';
import { DEFAULT_PROMPT, DEFAULT_JSON_SCHEMA } from './constants/defaults';
import { AboutModal } from './components/AboutModal';  // Add import
import Ajv from 'ajv';

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    prompt: params.get('prompt') || '',
    schema: params.get('schema') || ''
  };
}

const ajv = new Ajv({ allErrors: true });

function updateQueryParams(prompt: string, schema: string) {
  const params = new URLSearchParams();
  if (prompt) params.set('prompt', prompt);
  if (schema) params.set('schema', schema);
  
  const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState({}, '', newUrl);
}

function formatJSON(input: any, spaces = 2) {
  try {
    // If input is a string, parse it first
    const jsonObject = typeof input === "string" ? JSON.parse(input) : input;

    // Stringify with formatting
    return JSON.stringify(jsonObject, null, spaces);
  } catch (error) {
    // Handle invalid JSON
    return input;
  }
}

export function App() {
  // Get initial values from URL params or defaults
  const { prompt: urlPrompt, schema: urlSchema } = getQueryParams();
  
  const [mode, setMode] = useState<'normal' | 'structured'>('structured');
  const [selectedLLM, setSelectedLLM] = useState<LLMProvider>('OpenAI');
  const [model, setModel] = useState<LLMModel>('gpt-4o-mini');
  // Use URL params as initial values, falling back to defaults if not present
  const [prompt, setPrompt] = useState(urlPrompt || DEFAULT_PROMPT);
  const [output, setOutput] = useState('');
  const [jsonSchema, setJsonSchema] = useState(urlSchema || DEFAULT_JSON_SCHEMA);
  const [validation, setValidation] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useApiKey(selectedLLM);
  const [isLoading, setIsLoading] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);  // Add state

  // Update URL when prompt or schema changes
  useEffect(() => {
    updateQueryParams(prompt, jsonSchema);
  }, [prompt, jsonSchema]);

  // Custom prompt setter that updates both state and URL
  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
  };

  // Custom schema setter that updates both state and URL
  const handleSchemaChange = (newSchema: string) => {
    setJsonSchema(newSchema);
  };

  // Inside App component
  const validateOutput = (newOutput: string) => {
    if (mode !== 'structured') {
      setOutput(newOutput);
      return;
    }

    try {
      // First check if it's valid JSON
      const parsedOutput = JSON.parse(newOutput);
      setOutput(newOutput);

      // Parse the schema
      try {
        const schema = JSON.parse(jsonSchema);
        
        // Validate against schema
        const validate = ajv.compile(schema);
        const valid = validate(parsedOutput);

        if (valid) {
          setValidation('✅ Valid JSON that matches the schema');
        } else {
          const errors = validate.errors?.map(err => 
            `${err.instancePath} ${err.message}`
          ).join('\n');
          setValidation(`❌ Schema validation errors:\n${errors}`);
        }
      } catch (schemaError) {
        setValidation(`Error parsing schema: ${(schemaError as Error).message}`);
      }
    } catch (error) {
      setOutput(newOutput);
      setValidation(`❌ Invalid JSON: ${(error as Error).message}`);
    }
  };

  const handleExecute = async () => {
    if (!apiKey) {
      setValidation('Please set your API key in settings first');
      setIsSettingsOpen(true);
      return;
    }

    if (!prompt.trim()) {
      setValidation('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setValidation('');

    try {
      const response = await executeLLM({
        llm: selectedLLM,
        model,
        prompt,
        apiKey,
        jsonSchema: mode === 'structured' ? JSON.parse(jsonSchema) : undefined
      });

      validateOutput(response.output);

    } catch (error: any) {
      setValidation(`Error: ${error.message}`);
      console.error('Execution error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: 'normal' | 'structured') => {
    setMode(newMode);
    setOutput('');
    setValidation('');
    setPrompt(newMode === 'structured' ? DEFAULT_PROMPT : '');
    if (newMode === 'structured') {
      setJsonSchema(DEFAULT_JSON_SCHEMA);
    }
  };

  const handleLLMChange = (newLLM: LLMProvider) => {
    setSelectedLLM(newLLM);
    // Set appropriate default model for each provider
    switch (newLLM) {
      case 'OpenAI':
        setModel('gpt-4o-mini');
        break;
      case 'Ollama':
        setModel('llama2');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-2 sm:p-4">
      <div style={{overflowX: 'scroll'}} className="mx-auto bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
        <Header
          mode={mode}
          setMode={handleModeChange}
          onExecute={handleExecute}
          onSettings={() => setIsSettingsOpen(true)}
          selectedLLM={selectedLLM}
          onLLMChange={handleLLMChange}
          model={model}
          onModelChange={setModel}
          isLoading={isLoading}
          onAbout={() => setIsAboutOpen(true)}
        />
        
        {/* Updated grid layout for responsiveness */}
        <div style={{overflow: 'scroll'}} className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-700 h-[calc(100vh-8rem)]">
          <Editor
            label="Prompt"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Enter your prompt here..."
            className="h-[300px] md:h-auto" // Fixed height on mobile
          />
          <Editor
            label="Output"
            value={output}
            onChange={validateOutput}
            placeholder="Response will appear here..."
            className="h-[300px] md:h-auto" // Fixed height on mobile
          />
          
          {mode === 'structured' && (
            <>
              <Editor
                label="JSONSchema"
                value={jsonSchema}
                onChange={handleSchemaChange}
                placeholder="Enter your JSON schema here..."
                className="h-[300px] md:h-auto" // Fixed height on mobile
              />
              <Editor
                label="Validation / Errors"
                value={validation}
                onChange={setValidation}
                placeholder="Validation results will appear here..."
                readOnly
                className="h-[300px] md:h-auto" // Fixed height on mobile
              />
            </>
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedLLM={selectedLLM}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />

      <AboutModal 
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}