import React from "react";

export const Card = ({ children, className }) => {
  return (
    <div className={`bg-white p-6 shadow-lg rounded-2xl border border-gray-200 
    transition-transform transform hover:scale-105 duration-300 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className }) => {
  return <div className={`p-4 text-gray-700 ${className}`}>{children}</div>;
};
