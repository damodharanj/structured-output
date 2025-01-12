import React from 'react';

interface EditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export function Editor({ 
  label, 
  value, 
  onChange, 
  placeholder,
  readOnly = false,
  className = '' 
}: EditorProps) {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="bg-slate-700 px-4 py-2 text-slate-200 text-sm font-medium">
        {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="flex-1 bg-slate-800 text-slate-100 p-4 resize-none font-mono text-sm focus:outline-none"
        spellCheck={false}
      />
    </div>
  );
}