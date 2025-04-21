import React from "react";

export const Button = ({ children, onClick, className, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 
      rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:from-blue-600 hover:to-blue-800 
      active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};
