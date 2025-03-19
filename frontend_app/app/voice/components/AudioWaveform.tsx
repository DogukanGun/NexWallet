import React, { useEffect, useRef } from 'react';
import SiriWave from 'react-siriwave';

interface AudioWaveformProps {
  isActive: boolean;
  color?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isActive, color = '#2563eb' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
  }, []);

  return (
    <div ref={containerRef} className="h-24 w-full flex items-center justify-center">
      <SiriWave
        theme="ios9"
        width={width}
        height={100}
        amplitude={isActive ? 1 : 0.1}
        speed={0.2}
        frequency={4}
        color={color}
        autostart={true}
      />
    </div>
  );
}; 