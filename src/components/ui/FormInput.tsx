import React from 'react';

interface FormInputProps {
  label: string;
  type?: 'text' | 'number' | 'date';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export default function FormInput({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  className = "",
  disabled = false,
  error = false
}: FormInputProps) {
  const handleDateChange = (inputValue: string) => {
    if (type === 'date' && inputValue) {
      const date = new Date(inputValue);
      const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      onChange(formatted);
    } else {
      onChange(inputValue);
    }
  };

  const getInputValue = () => {
    if (type === 'date' && typeof value === 'string' && value.includes('/')) {
      return value.split('/').reverse().join('-');
    }
    return value;
  };

  return (
    <div className={`h-16 border rounded-lg px-5 py-2 ${error ? 'border-red-500' : 'border-[#D8DDE7]'} ${className}`}>
      <div className="text-[11px] font-medium text-[rgba(29,36,51,0.65)]">{label}</div>
      <input 
        type={type}
        value={getInputValue()}
        onChange={(e) => handleDateChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full text-sm font-medium text-[#1D2433] border-none outline-none bg-transparent disabled:opacity-50"
      />
    </div>
  );
}
