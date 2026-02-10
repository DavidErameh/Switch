import React, { useState } from 'react';
import { NeumorphicDropButton } from './components/NeumorphicDropButton';

export default function App() {
  const [isOn, setIsOn] = useState(true);

  const toggleSwitch = () => {
    setIsOn(!isOn);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center transition-colors duration-700 ease-in-out p-4"
      style={{ backgroundColor: isOn ? '#E0E5EC' : '#535D6C' }}
    >
      <div className="flex-grow flex flex-col items-center justify-center">
        <NeumorphicDropButton isOn={isOn} onToggle={toggleSwitch} />
      </div>

      <div className={`flex flex-col items-center gap-3 pb-8 transition-colors duration-700 ease-in-out ${isOn ? 'text-slate-500' : 'text-slate-400'}`}>
        <span className="text-xs font-medium tracking-[0.2em] opacity-60">made by dave</span>
        <a 
          href="https://x.com/daviderameh_" 
          target="_blank" 
          rel="noopener noreferrer"
          className="opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-300"
          aria-label="X (formerly Twitter)"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </div>
    </div>
  );
}