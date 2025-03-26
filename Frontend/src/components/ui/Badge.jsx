import React from 'react';

export default function Badge ({ 
  children, 
  variant = 'default', 
  size = 'md'        
})  {
  return (
    <span className={`badge ${variant} ${size}`}>
      {children}
    </span>
  );
};