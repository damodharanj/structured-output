import React from 'react';
import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-white mb-4">About JSONSchema Structured Output Playground</h2>
        
        <div className="space-y-4 text-slate-300">
          <p>
            This playground helps you experiment with structured outputs from Large Language Models (LLMs) using JSONSchema. 
            It supports two modes:
          </p>
          
          <div className="space-y-2">
            <h3 className="font-medium text-white">Normal Mode</h3>
            <p>Get free-form responses from the LLM without any structure constraints.</p>
            
            <h3 className="font-medium text-white mt-3">Structured Mode</h3>
            <p>Force the LLM to respond in a specific JSON format defined by your schema. This ensures consistent, parseable outputs.</p>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-md">
            <h3 className="font-medium text-white mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Support for multiple LLM providers (OpenAI, Ollama)</li>
              <li>JSONSchema validation for structured outputs</li>
              <li>Shareable URLs with your prompt and schema</li>
              <li>Local API key storage</li>
              <li>Mobile-responsive design</li>
            </ul>
          </div>
          <p className="text-center text-sm text-slate-400 mt-4">
            <a href="https://github.com/damodharanj/structured-output">Github</a>
          </p>
          <p className="text-center text-sm text-slate-400 mt-4">
            Made with ❤️ from India
          </p>

        </div>
      </div>
    </div>
  );
}