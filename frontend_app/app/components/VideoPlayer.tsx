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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "90%",
          maxWidth: "1280px",
          aspectRatio: "16/9",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-40px",
            right: "-10px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            fontSize: "16px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          ✕
        </button>
        {videoId ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              borderRadius: "8px",
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
            <p className="text-white">Invalid YouTube URL</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
