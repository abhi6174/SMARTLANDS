import React from 'react';

export default function Card ({ 
  children, 
  title, 
  footer, 
  hoverEffect = false 
}) {
  return (
    <div className={`card ${hoverEffect ? 'hover-effect' : ''}`}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};