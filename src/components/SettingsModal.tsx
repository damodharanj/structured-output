import React, { useState } from 'react';
import { X } from 'lucide-react';
import { validateApiKey } from '../utils/apiKeyValidator';
import { LLMProvider } from '../services/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLLM: LLMProvider;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function SettingsModal({ isOpen, onClose, selectedLLM, apiKey, onApiKeyChange }: SettingsModalProps) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const validationError = validateApiKey(selectedLLM, tempKey);
    if (validationError) {
      setError(validationError);
      return;
    }

    onApiKeyChange(tempKey.trim());
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">API Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {selectedLLM} API Key
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => {
                setTempKey(e.target.value);
                setError('');
              }}
              placeholder={`Enter your ${selectedLLM} API key`}
              className="w-full bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            {error && (
              <p className="text-red-400 text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Save
            </button>
          </div>

          <p className="text-sm text-slate-400 mt-4">
            Your API key is stored locally and never shared. For OpenAI, get your key from{' '}
            <a 
              href="https://platform.openai.com/account/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              platform.openai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}