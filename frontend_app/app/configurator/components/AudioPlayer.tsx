import { useState, useRef, useEffect } from 'react';

type AudioPlayerProps = {
  voiceData: string;
  voiceName: string;
};

export const AudioPlayer = ({ voiceData, voiceName }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <button
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex-1">
        <p className="text-sm text-gray-300">{voiceName}</p>
        <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 w-0"></div>
        </div>
      </div>
      <audio ref={audioRef} src={`data:audio/wav;base64,${voiceData}`} className="hidden" />
    </div>
  );
}; 