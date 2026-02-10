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
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.connect(snapGain);
    snapGain.connect(masterGain);

    // 2. The "Thud" (Plastic casing resonance)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterGain);

    if (type === 'down') {
      // PRESS: Sharper, faster attack for snappiness
      snapOsc.frequency.setValueAtTime(4500, t);
      snapOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.008);
      
      snapGain.gain.setValueAtTime(0.7, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

      bodyOsc.frequency.setValueAtTime(400, t);
      bodyOsc.frequency.exponentialRampToValueAtTime(100, t + 0.03);
      
      bodyGain.gain.setValueAtTime(0.3, t);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    } else {
      // RELEASE: Quick return
      snapOsc.frequency.setValueAtTime(2800, t);
      snapOsc.frequency.exponentialRampToValueAtTime(800, t + 0.012);
      
      snapGain.gain.setValueAtTime(0.5, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

      bodyOsc.frequency.setValueAtTime(300, t);
      bodyOsc.frequency.exponentialRampToValueAtTime(60, t + 0.05);
      
      bodyGain.gain.setValueAtTime(0.4, t);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    }

    // Start and Cleanup
    snapOsc.start(t);
    snapOsc.stop(t + 0.03); 

    bodyOsc.start(t);
    bodyOsc.stop(t + 0.1); 
  };

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to avoid scrolling/zooming issues on mobile during quick taps
    // but allow scrolling if they miss the button, so we don't preventDefault globally.
    // However, for the button itself, we want instant reaction.
    setIsPressed(true);
    playClickSound('down');
  };
  
  const handlePressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent ghost clicks on mobile
    if (e.type === 'touchend') e.preventDefault();
    
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
  const darkBase = '#535D6C';

  // Shadows - Slightly tighter blur for a crisper look
  const lightFlat = '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255, 0.5)';
  const lightPressed = 'inset 5px 5px 10px rgba(163,177,198, 0.7), inset -5px -5px 10px rgba(255,255,255, 0.8)';

  const darkFlat = '12px 12px 24px rgba(0,0,0,0.4), -8px -8px 16px rgba(255,255,255, 0.05)';
  const darkPressed = 'inset 6px 6px 12px rgba(0,0,0,0.4), inset -6px -6px 12px rgba(255,255,255, 0.05)';

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
    <div className="flex flex-col items-center gap-5 md:gap-8">
      <button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className="relative flex items-center justify-center w-32 h-32 md:w-48 md:h-48 rounded-full outline-none select-none touch-manipulation"
        style={{
          backgroundColor: currentBase,
          boxShadow: isPressed ? currentPressed : currentFlat,
          transform: isPressed ? 'scale(0.96)' : 'scale(1)',
          // Separate transitions: Instant physical response, smooth color fade
          transitionProperty: 'background-color, box-shadow, transform',
          transitionDuration: `700ms, ${isPressed ? '50ms' : '150ms'}, ${isPressed ? '50ms' : '150ms'}`,
          transitionTimingFunction: 'ease, ease-out, ease-out',
          WebkitTapHighlightColor: 'transparent'
        }}
        aria-label={isOn ? "Turn Off" : "Turn On"}
        aria-pressed={isPressed}
      >
        {/* Icon */}
        <div className={`transition-all duration-700 ease-in-out ${iconClass}`}>
          <svg
            viewBox="0 0 24 24"
            fill={isOn ? "currentColor" : "none"} 
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10 md:w-16 md:h-16"
          >
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
      </button>

      {/* Label Text */}
      <span 
        className={`text-base md:text-xl font-medium tracking-[0.2em] select-none transition-all duration-700 ease-in-out ${labelClass}`}
      >
        SWITCH
      </span>
    </div>
  );
};