import React from 'react';
import './Button.css';

const Button = ({ text, onClick, variant = 'primary', className = '' }) => {
  // Kết hợp class cơ bản với variant và className tùy chỉnh
  const buttonClass = `custom-button custom-button--${variant} ${className}`;

  return (
    <button className={buttonClass} onClick={onClick}>
      <span className="button-text">{text}</span>
    </button>
  );
};

export default Button;