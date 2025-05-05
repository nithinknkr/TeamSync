import React from 'react';

const Logo = ({ theme = 'dark' }) => {
  const textColor = theme === 'dark' ? 'text-gray-900' : 'text-white';
  const logoColor = theme === 'dark' ? 'text-black' : 'text-white';

  return (
    <div className="flex items-center">
      <svg 
        className={`h-8 w-8 ${logoColor} transition-colors duration-300`} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 2L2 7L12 12L22 7L12 2Z" 
          fill="currentColor" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M2 17L12 22L22 17" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M2 12L12 17L22 12" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className={`ml-2 text-xl font-bold ${textColor} transition-colors duration-300`}>TeamSync</span>
    </div>
  );
};

export default Logo;