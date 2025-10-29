interface Video {
  id: string;
  title: string;
  description: string;
  videoNumber: number;
  strategyId: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  canAccess: boolean;
}

interface VideoListProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
}

export const VideoList = ({ videos, onVideoClick }: VideoListProps) => {
  return (
    <div className="video-list">
      {videos.map((video) => (
        <div
          key={video.id}
          className={`video-card ${video.isLocked ? 'locked' : ''} ${video.isCurrent ? 'current' : ''} ${video.isCompleted ? 'completed' : ''}`}
          onClick={() => onVideoClick(video)}
          style={{ cursor: video.canAccess ? 'pointer' : 'not-allowed' }}
        >
          <div className="video-number">
            {video.isCompleted && <span className="completed-badge">✓</span>}
            {video.isCurrent && !video.isCompleted && (
              <span className="current-badge">▶</span>
            )}
            {video.isLocked && <span className="locked-badge">🔒</span>}
            {!video.isCompleted && !video.isCurrent && !video.isLocked && (
              <span className="number-badge">{video.videoNumber}</span>
            )}
          </div>

          <div className="video-info">
            <h3 className="video-title">
              Video {video.videoNumber}: {video.title}
            </h3>
            <p className="video-description">
              {video.description}
            </p>
          </div>

          <div className="video-status">
            {video.isCompleted && (
              <span className="status-badge completed-status">
                Completed
              </span>
            )}
            {video.isCurrent && !video.isCompleted && (
              <span className="status-badge current-status">
                Continue
              </span>
            )}
            {video.isLocked && (
              <span className="status-badge locked-status">
                Locked
              </span>
            )}
            {!video.isCompleted && !video.isCurrent && !video.isLocked && (
              <span className="status-badge ready-status">
                Ready
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

