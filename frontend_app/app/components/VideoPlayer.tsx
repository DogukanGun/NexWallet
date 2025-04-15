interface VideoModalProps {
  onClose: () => void;
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoModalProps> = ({ onClose, videoUrl }) => {
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  return (
    <div className="w-full h-full">
      {videoId ? (
        <div className="relative pb-[56.25%] h-0 overflow-hidden">
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full bg-base-200 rounded-lg">
          <p className="text-base-content">Invalid YouTube URL</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
