import React, { useState, useRef } from 'react';

interface NeumorphicDropButtonProps {
  isOn: boolean;
  onToggle: () => void;
}

export const NeumorphicDropButton: React.FC<NeumorphicDropButtonProps> = ({ isOn, onToggle }) => {
  const [isPressed, setIsPressed] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context lazily on user interaction
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playClickSound = (type: 'down' | 'up') => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 1.0;
    masterGain.connect(ctx.destination);

    // 1. The "Snap" (High frequency mechanical click)
    // Triangle wave for that sharp, metallic microswitch feel
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.connect(snapGain);
    snapGain.connect(masterGain);

    // 2. The "Thud" (Plastic casing resonance)
    // Sine wave for the button housing body
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterGain);

    if (type === 'down') {
      // PRESS: High-tension mechanical release
      // Very fast, high-pitched chirp 
      snapOsc.frequency.setValueAtTime(4500, t);
      snapOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.01);
      
      snapGain.gain.setValueAtTime(0.6, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

      // Short, tight body thud
      bodyOsc.frequency.setValueAtTime(400, t);
      bodyOsc.frequency.exponentialRampToValueAtTime(100, t + 0.04);
      
      bodyGain.gain.setValueAtTime(0.2, t);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    } else {
      // RELEASE: Plastic return spring
      // Slightly lower, "hollower" sound
      snapOsc.frequency.setValueAtTime(2800, t);
      snapOsc.frequency.exponentialRampToValueAtTime(800, t + 0.015);
      
      snapGain.gain.setValueAtTime(0.4, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

      // More resonance on the return stroke
      bodyOsc.frequency.setValueAtTime(300, t);
      bodyOsc.frequency.exponentialRampToValueAtTime(60, t + 0.06);
      
      bodyGain.gain.setValueAtTime(0.3, t);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    }

    // Start and Cleanup
    snapOsc.start(t);
    snapOsc.stop(t + 0.03); 

    bodyOsc.start(t);
    bodyOsc.stop(t + 0.1); 
  };

  const handlePressStart = () => {
    setIsPressed(true);
    playClickSound('down');
  };
  
  const handlePressEnd = () => {
    if (isPressed) {
      setIsPressed(false);
      playClickSound('up');
      onToggle();
    }
  };

  const handleMouseLeave = () => {
    if (isPressed) {
      setIsPressed(false);
    }
  };

  // --- Theme Configurations ---
  
  // Base Colors
  const lightBase = '#E0E5EC';
  const darkBase = '#535D6C'; // Dimmed room color

  // Shadows
  const lightFlat = '12px 12px 24px rgba(163,177,198,0.6), -12px -12px 24px rgba(255,255,255, 0.5)';
  const lightPressed = 'inset 6px 6px 12px rgba(163,177,198, 0.7), inset -6px -6px 12px rgba(255,255,255, 0.8)';

  // Dim Mode Shadows
  const darkFlat = '15px 15px 30px rgba(0,0,0,0.4), -10px -10px 20px rgba(255,255,255, 0.05)';
  const darkPressed = 'inset 8px 8px 16px rgba(0,0,0,0.4), inset -8px -8px 16px rgba(255,255,255, 0.05)';

  const currentBase = isOn ? lightBase : darkBase;
  const currentFlat = isOn ? lightFlat : darkFlat;
  const currentPressed = isOn ? lightPressed : darkPressed;

  // Visual styles
  const iconClass = isOn 
    ? 'text-indigo-400 opacity-90' 
    : 'text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)] opacity-80';
    
  const labelClass = isOn 
    ? 'text-indigo-400 opacity-90 drop-shadow-sm' 
    : 'text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.3)] opacity-70';

  return (
    <div className="flex flex-col items-center gap-8">
      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className="relative flex items-center justify-center w-48 h-48 rounded-full outline-none tap-highlight-transparent cursor-pointer select-none"
        style={{
          backgroundColor: currentBase,
          boxShadow: isPressed ? currentPressed : currentFlat,
          transform: isPressed ? 'scale(0.97)' : 'scale(1)',
          transitionProperty: 'background-color, box-shadow, transform',
          transitionDuration: '700ms, 150ms, 150ms',
          transitionTimingFunction: 'ease, ease-out, ease-out'
        }}
        aria-label={isOn ? "Turn Off" : "Turn On"}
        aria-pressed={isPressed}
      >
        {/* Icon */}
        <div className={`transition-all duration-700 ease-in-out ${iconClass}`}>
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill={isOn ? "currentColor" : "none"} 
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
      </button>

      {/* Label Text */}
      <span 
        className={`text-xl font-medium tracking-[0.2em] select-none transition-all duration-700 ease-in-out ${labelClass}`}
      >
        SWITCH
      </span>
    </div>
  );
};