import { useRef, useEffect } from 'react';
import Image from 'next/image';

type USAAnimationProps = {
  onClose: () => void;
};

export const USAAnimation = ({ onClose }: USAAnimationProps) => {
  const usaAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer bg-black/50"
      onClick={onClose}
    >
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-700 animate-fadeIn">
          <div className="usa-stars absolute inset-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="usa-star"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.1,
                  fontSize: `${Math.random() * 10 + 10}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 4 + 3}s`
                }}
              >
                ⭐
              </div>
            ))}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="usa-flag-container">
                <Image 
                  src="/images/usa-flag.png" 
                  alt="USA Flag"
                  width={300}
                  height={200}
                  className="usa-flag-image"
                />
                <div className="eagle-icon">
                  <Image 
                    src="/images/eagle-icon.png" 
                    alt="Eagle Icon"
                    width={80}
                    height={80}
                    className="hidden"
                  />
                </div>
              </div>
              <h1 className="text-white text-5xl font-bold animate-text my-6">AMERICA</h1>
              <div className="icons-container mt-2 flex justify-center gap-6">
                <span className="usa-icon text-2xl">🦅</span>
                <span className="usa-icon delay-1 text-2xl">🗽</span>
                <span className="usa-icon delay-2 text-2xl">🇺🇸</span>
              </div>
            </div>
          </div>
        </div>
        
        <audio ref={usaAudioRef} src="/sounds/us.mp3" className="hidden" />
      </div>
    </div>
  );
}; 