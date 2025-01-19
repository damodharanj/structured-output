import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { SettingsModal } from './components/SettingsModal';
import { useApiKey } from './hooks/useApiKey';
import { executeLLM } from './services/llmService';
import { LLMProvider, LLMModel } from './services/types';
import { DEFAULT_PROMPT, DEFAULT_JSON_SCHEMA } from './constants/defaults';
import { AboutModal } from './components/AboutModal';  // Add import
import Ajv from 'ajv/dist/2020';
import { Analytics } from "@vercel/analytics/react"
import { ValidatorType, validatorOptions } from './services/types';
import { validateWithAjv, validateWithHyperjump } from './services/validators';

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    prompt: params.get('prompt') || '',
    schema: params.get('schema') || '',
    output: params.get('output') || ''
  };
}

const ajv = new Ajv({ strict: true, strictRequired: true, allErrors: true, strictSchema: false, dynamicRef: true });

function updateQueryParams(prompt: string, schema: string, output: string) {
  const params = new URLSearchParams();
  if (prompt) params.set('prompt', prompt);
  if (schema) params.set('schema', schema);
  if (output) params.set('output', output);
  
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
  const { prompt: urlPrompt, schema: urlSchema, output: urlOutput } = getQueryParams();
  
  const [mode, setMode] = useState<'normal' | 'structured'>('structured');
  const [selectedLLM, setSelectedLLM] = useState<LLMProvider>('OpenAI');
  const [model, setModel] = useState<LLMModel>('gpt-4o-mini');
  // Use URL params as initial values, falling back to defaults if not present
  const [prompt, setPrompt] = useState(urlPrompt || DEFAULT_PROMPT);
  const [output, setOutput] = useState(urlOutput || '');
  const [jsonSchema, setJsonSchema] = useState(urlSchema || DEFAULT_JSON_SCHEMA);
  const [validation, setValidation] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useApiKey(selectedLLM);
  const [isLoading, setIsLoading] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);  // Add state
  const [isPromptVisible, setIsPromptVisible] = useState(true);
  const [validator, setValidator] = useState<ValidatorType>('AJV');

  // Update URL when prompt or schema changes
  useEffect(() => {
    updateQueryParams(prompt, jsonSchema, output);
  }, [prompt, jsonSchema, output]);

  // Custom prompt setter that updates both state and URL
  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
  };

  // Custom schema setter that updates both state and URL
  const handleSchemaChange = (newSchema: string) => {
    setJsonSchema(newSchema);
  };

  const handleOutputChange = (newOutput: string) => {
    setOutput(newOutput);
    validateOutput(newOutput);
  };

  // Inside App component
  const validateOutput = async (newOutput: string) => {
    if (mode !== 'structured') {
      setOutput(newOutput);
      return;
    }

    try {
      // First check if it's valid JSON
      const parsedOutput = JSON.parse(newOutput);
      // handleOutputChange(newOutput);
      setOutput(newOutput);

      // Parse the schema
      try {
        const schema = JSON.parse(jsonSchema);
        
        const validation = validator === 'AJV' 
          ? await validateWithAjv(schema, parsedOutput)
          : await validateWithHyperjump(schema, parsedOutput);

        if (validation.valid) {
          setValidation('✅ Valid JSON that matches the schema');
        } else {
          const errors = ((validation as any).errors)?.map((err: any) => 
            `${err.instancePath} ${err.message}`
          ).join('\n');
          setValidation(`❌ Schema validation errors:\n${errors}`);
        }
      } catch (schemaError) {
        setOutput(newOutput);
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
          isPromptVisible={isPromptVisible}
          onTogglePrompt={() => setIsPromptVisible(!isPromptVisible)}
          validator={validator}
          onValidatorChange={setValidator}
        />
        
        {/* Updated grid layout for responsiveness */}
        {/* Replace the existing grid div with this updated version */}
        <div style={{overflow: 'scroll'}} className="grid grid-cols-12 gap-px bg-slate-700 h-[calc(100vh-8rem)]">
          {/* Left column - 8 columns wide */}
            <div className="col-span-6 flex flex-col gap-px">
              <div className={`${isPromptVisible ? 'col-span-6' : 'hidden'} flex-1`}>
                <Editor
                  label="Prompt"
                  value={prompt}
                  onChange={handlePromptChange}
                  placeholder="Enter your prompt here..."
                />
              </div>
              <Editor
                label={
                  <div className="flex justify-between items-center w-full">
                    <span>Output</span>
                    <button 
                      onClick={() => {
                        try {
                          const formatted = formatJSON(output);
                          validateOutput(formatted);
                        } catch (error) {
                          // If formatting fails, keep existing output
                          console.error('Failed to format JSON:', error);
                        }
                      }}
                      className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded"
                    >
                      Format JSON
                    </button>
                  </div>
                }
                value={output}
                onChange={validateOutput}
                placeholder="Response will appear here..."
                className="flex-1"
              />
              <Editor
                label="Validation / Errors"
                value={validation}
                onChange={setValidation}
                placeholder="Validation results will appear here..."
                readOnly
                className="flex-1"
              />
            </div>

          {/* Right column - 4 columns wide */}
          <div className="col-span-6">
            {mode === 'structured' && (
              <Editor
                label="JSONSchema"
                value={jsonSchema}
                onChange={handleSchemaChange}
                placeholder="Enter your JSON schema here..."
                className="h-full"
              />
            )}
          </div>
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
    <Analytics></Analytics>
    </div>
  );
}