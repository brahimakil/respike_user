interface Progress {
  totalVideos: number;
  completedCount: number;
  progressPercentage: number;
  currentVideoId: string | null;
}

interface Video {
  id: string;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}

interface ProgressOverviewProps {
  progress: Progress;
  videos: Video[];
}

export const ProgressOverview = ({ progress, videos }: ProgressOverviewProps) => {
  const currentVideo = videos.find(v => v.isCurrent);
  const nextLockedVideo = videos.find(v => v.isLocked);

  return (
    <div className="progress-overview">
      <div className="progress-stats">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{progress.completedCount}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{progress.progressPercentage}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📹</div>
          <div className="stat-info">
            <span className="stat-value">{progress.totalVideos}</span>
            <span className="stat-label">Total Videos</span>
          </div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress.progressPercentage}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {progress.completedCount} of {progress.totalVideos} videos completed
        </span>
      </div>

      {currentVideo && (
        <div className="current-video-info">
          <span className="current-label">📍 Current Video:</span>
          <span className="current-title">{currentVideo.title}</span>
        </div>
      )}

      {progress.completedCount === progress.totalVideos && progress.totalVideos > 0 && (
        <div className="completion-message">
          <span className="completion-icon">🎉</span>
          <span>Congratulations! You've completed all videos!</span>
        </div>
      )}
    </div>
  );
};

