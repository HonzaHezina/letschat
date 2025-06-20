"use client";

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
};

const Input: React.FC<InputProps> = ({ label, name, error, icon, className = '', ...props }) => {
  const baseInputClasses = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const errorInputClasses = error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "";
  const iconPaddingClass = icon ? "pl-10" : "";

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-gray-400" })}
          </div>
        )}
        <input
          id={name}
          name={name}
          className={`${baseInputClasses} ${errorInputClasses} ${iconPaddingClass} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
