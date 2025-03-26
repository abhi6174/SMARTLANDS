import React from 'react';

export default function Input ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false
}) {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        className={`input-field ${error ? 'error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};