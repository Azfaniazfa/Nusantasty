import React from 'react';

const Button = ({ type, onClick, disabled, children, className }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    aria-busy={disabled}
    className={`bg-[#c34a36] text-white hover:bg-[#ff8066] p-2 rounded ${className}`}
  >
    {children}
  </button>
);

export default Button;
