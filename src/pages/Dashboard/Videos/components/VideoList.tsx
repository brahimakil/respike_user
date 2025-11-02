import { MdLock, MdCheckCircle, MdPlayArrow, MdOndemandVideo } from 'react-icons/md';

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
  coverPhotoUrl?: string;
}

interface VideoListProps {
  videos: Video[];
  onVideoClick: (video: Video) => void;
}

export const VideoList = ({ videos, onVideoClick }: VideoListProps) => {
  return (
    <div className="video-grid">
      {videos.map((video) => (
        <div
          key={video.id}
          className={`video-card-grid ${video.isLocked ? 'locked' : ''} ${video.isCurrent ? 'current' : ''} ${video.isCompleted ? 'completed' : ''}`}
          onClick={() => onVideoClick(video)}
          style={{ cursor: video.canAccess ? 'pointer' : 'not-allowed' }}
        >
          {/* Video Cover Photo */}
          <div className="video-thumbnail">
            {video.coverPhotoUrl ? (
              <img src={video.coverPhotoUrl} alt={video.title} />
            ) : (
              <div className="video-placeholder">
                <span className="video-icon"><MdOndemandVideo /></span>
              </div>
            )}
            
            {/* Lock Overlay */}
            {video.isLocked && (
              <div className="lock-overlay">
                <span className="lock-icon"><MdLock /></span>
              </div>
            )}

            {/* Status Badge */}
            <div className="video-badge">
              {video.isCompleted && (
                <span className="badge completed-badge"><MdCheckCircle /> Completed</span>
              )}
              {video.isCurrent && !video.isCompleted && (
                <span className="badge current-badge"><MdPlayArrow /> Continue</span>
              )}
              {video.isLocked && (
                <span className="badge locked-badge"><MdLock /> Locked</span>
              )}
              {!video.isCompleted && !video.isCurrent && !video.isLocked && (
                <span className="badge ready-badge">Ready</span>
              )}
            </div>
          </div>

          {/* Video Info */}
          <div className="video-card-content">
            <div className="video-number-label">Lesson {video.videoNumber}</div>
            <h3 className="video-card-title">{video.title}</h3>
            <p className="video-card-description">{video.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

