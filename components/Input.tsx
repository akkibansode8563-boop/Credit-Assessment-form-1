
import React from 'react';

interface InputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({ label, value, onChange, type = 'text', required, placeholder }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
      />
    </div>
  );
};

export default Input;
