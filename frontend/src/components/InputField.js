import React from 'react';

const InputField = ({
  type,
  placeholder,
  value,
  onChange,
  required = false,
  id,
  className,
}) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    aria-label={placeholder}
    className={`border rounded p-2 ${className}`}
  />
);

export default InputField;
