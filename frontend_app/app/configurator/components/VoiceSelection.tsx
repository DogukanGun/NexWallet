import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AudioPlayer } from './AudioPlayer';
import { SavedVoice } from '../../services/ApiService';

type VoiceSelectionProps = {
  selectedVoice: string;
  savedVoices: SavedVoice[];
  isLoadingVoices: boolean;
  onVoiceSelect: (voiceId: string) => void;
};

export const VoiceSelection = ({
  selectedVoice,
  savedVoices,
  isLoadingVoices,
  onVoiceSelect,
}: VoiceSelectionProps) => {
  const router = useRouter();
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  const handlePreviewToggle = () => {
    if (previewAudioRef.current) {
      if (isPreviewPlaying) {
        previewAudioRef.current.pause();
      } else {
        previewAudioRef.current.play();
      }
      setIsPreviewPlaying(!isPreviewPlaying);
    }
  };

  return (
    <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-white">Voice Selection</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <select
              value={selectedVoice}
              onChange={(e) => onVoiceSelect(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a voice</option>
              {savedVoices.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name || voice.voice_id}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => router.push('/app/voice-customization')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Voice
          </button>
          
          {selectedVoice !== '' && (
            <button
              onClick={handlePreviewToggle}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d={isPreviewPlaying ? "M6 4h4v16H6V4zm8 0h4v16h-4V4z" : "M8 5v14l11-7z"} />
              </svg>
              Preview
            </button>
          )}
        </div>

        {selectedVoice !== '' && (
          <div className="mt-4">
            <AudioPlayer
              voiceData={savedVoices.find(voice => voice.voice_id === selectedVoice)?.voice_bytes ?? ""}
              voiceName={savedVoices.find(voice => voice.voice_id === selectedVoice)?.voice_id ?? ""}
            />
          </div>
        )}

        {isLoadingVoices && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading voices...</p>
          </div>
        )}
      </div>
    </div>
  );
}; 