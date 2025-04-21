import React from "react";

export const Input = ({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  className, 
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 text-lg border border-gray-300 rounded-xl 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
      shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
      {...props}
    />
  );
};
