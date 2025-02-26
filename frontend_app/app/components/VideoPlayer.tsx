interface VideoModalProps {
  onClose: () => void;
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoModalProps> = ({ onClose, videoUrl }) => {
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
      onClick={onClose} // Close modal when clicking outside the video
    >
      <div
        style={{
          position: "relative",
          maxWidth: "90%",
          maxHeight: "90%",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the video container
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-10px",
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
        <video
          src={videoUrl}
          controls
          autoPlay
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            borderRadius: "8px",
          }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
