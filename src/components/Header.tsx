import React from 'react';
import { Settings, Play, Loader2,Info } from 'lucide-react';
import { LLMProvider, LLMModel, llmOptions, modelsByProvider } from '../services/types';

interface HeaderProps {
  mode: 'normal' | 'structured';
  setMode: (mode: 'normal' | 'structured') => void;
  onExecute: () => void;
  onSettings: () => void;
  selectedLLM: LLMProvider;
  onLLMChange: (llm: LLMProvider) => void;
  model: LLMModel;
  onModelChange: (model: LLMModel) => void;
  isLoading: boolean;
  onAbout: () => void;
}

export function Header({ 
  mode, 
  setMode, 
  onExecute, 
  onSettings, 
  selectedLLM, 
  onLLMChange,
  model,
  onModelChange,
  isLoading,
  onAbout
}: HeaderProps) {
  const modelOptions = modelsByProvider[selectedLLM];

  const handleLLMChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as LLMProvider;
    const defaultModel = modelsByProvider[newProvider][0] as LLMModel;
    onLLMChange(newProvider);
    onModelChange(defaultModel);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value as LLMModel;
    if (modelsByProvider[selectedLLM].includes(newModel as any)) {
      onModelChange(newModel);
    }
  };

  return (
    <div className="bg-slate-800 p-4 flex items-center juxstify-between border-b border-slate-700">
      <h1 className="text-white font-medium">JSONSchema Structured Output Playground</h1>
      
      <div className="flex-1" />
      
      <select 
        value={mode}
        onChange={(e) => setMode(e.target.value as 'normal' | 'structured')}
        style={{margin: 10}}
        className="bg-slate-700 text-white px-3 py-1.5 rounded-md border border-slate-600"
      >
        <option value="normal">Normal</option>
        <option value="structured">Structured</option>
      </select>

      <div className="flex items-center gap-2">
        <select
          value={selectedLLM}
          onChange={handleLLMChange}
          className="bg-slate-700 text-white px-3 py-1.5 rounded-md border border-slate-600"
        >
          {llmOptions.map(llm => (
            <option key={llm} value={llm}>{llm}</option>
          ))}
        </select>

        <select
          className="bg-slate-700 text-white px-3 py-1.5 rounded-md border border-slate-600"
          value={model}
          style={{margin: 10}}
          onChange={handleModelChange}
        >
          {modelOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <button
        onClick={onExecute}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md flex items-center gap-2"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
        Execute
      </button>

      <button
        onClick={onSettings}
        className="text-slate-300 hover:text-white p-1.5 rounded-md hover:bg-slate-700"
      >
        <Settings size={20} />
      </button>

      <button
        onClick={onAbout}
        className="text-slate-300 hover:text-white p-1.5 rounded-md hover:bg-slate-700 ml-2"
      >
        <Info size={20} />
      </button>
    </div>
  );
}