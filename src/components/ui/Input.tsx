"use client";

import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  wrapperClassName?: string; // Added for more styling flexibility
};

const Input: React.FC<InputProps> = ({ label, name, error, icon, className = '', wrapperClassName = '', ...props }) => {
  // Updated input classes with new theme colors
  const baseInputClasses = "block w-full px-4 py-2.5 border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light sm:text-sm text-text-primary bg-white placeholder-gray-400";
  // If error, use danger color for border and focus ring, otherwise use primary for focus.
  const errorInputClasses = error ? "border-danger focus:ring-danger focus:border-danger" : "focus:border-primary";
  const iconPaddingClass = icon ? "pl-11" : ""; // Adjusted padding for icon

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm"> {/* Added rounded-lg and shadow-sm to wrapper for consistency if needed, input itself has shadow-sm too. */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
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
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Input;
