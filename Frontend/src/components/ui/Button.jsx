import React from 'react';

export default function Button ({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost'
  size = 'medium',    // 'small', 'medium', 'large'
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  loading = false
}) {
  return (
    <button
      type={type}
      className={`btn ${variant} ${size} ${fullWidth ? 'full-width' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};