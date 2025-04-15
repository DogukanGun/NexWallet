import { useRef, useEffect } from 'react';
import Image from 'next/image';

type GermanAnimationProps = {
  onClose: () => void;
};

export const GermanAnimation = ({ onClose }: GermanAnimationProps) => {
  const germanyAudioRef = useRef<HTMLAudioElement>(null);

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
        <div className="german-bg absolute inset-0 bg-gradient-to-b from-black via-red-700 to-yellow-500 animate-fadeIn"></div>
        
        <div className="particles-container">
          {Array.from({ length: 60 }).map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 20 + 5}px`,
                height: `${Math.random() * 20 + 5}px`,
                backgroundColor: i % 3 === 0 ? 'black' : i % 3 === 1 ? 'red' : 'gold',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-96 h-56 mb-4">
              <Image
                src="/images/german-flag.png"
                alt="German Flag"
                fill
                className="object-cover rounded-md shadow-lg"
                priority
              />
            </div>
            <h1 className="text-white text-6xl font-bold animate-text my-6">Deutschland</h1>
            <div className="text-3xl fade-in-up">🦅</div>
          </div>
        </div>
        
        <audio ref={germanyAudioRef} src="/sounds/de.mp3" className="hidden" />
      </div>
    </div>
  );
}; 