import React from 'react';
import { cn } from '../../lib/utils';

interface BorderBeamProps {
  size?: number;
  duration?: number;
  className?: string;
  children: React.ReactNode;
  theme?: string;  // Adding theme prop
}

export function BorderBeam({ 
  size = 150, 
  duration = 12,
  className,
  children,
  theme = 'dark'  // Default theme
}: BorderBeamProps) {
  const beamColor = theme === 'light' ? 'black' : 'white'; // Conditionally set beam color

  return (
    <div className={cn(
      "relative rounded-3xl p-1 border border-transparent bg-background overflow-hidden",
      className
    )}>
      <div
        className="absolute inset-px z-0 overflow-hidden rounded-3xl [mask-image:linear-gradient(black,black)]"
        style={{
          maskComposite: 'exclude'
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"
          style={{
            width: `${size}%`,
            left: '50%',
            top: '50%',
            aspectRatio: '1',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            animation: `border-beam ${duration}s linear infinite`,
            background: `conic-gradient(from 0deg, transparent 0 340deg, ${beamColor} 360deg)`  // Use beamColor here
          }}
        />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
