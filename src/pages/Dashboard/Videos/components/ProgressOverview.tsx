import { MdCheckCircle, MdShowChart, MdOndemandVideo } from 'react-icons/md';

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

  return (
    <div className="progress-overview">
      <div className="progress-stats">
        <div className="stat-card">
          <div className="stat-icon"><MdCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-value">{progress.completedCount}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><MdShowChart /></div>
          <div className="stat-info">
            <span className="stat-value">{progress.progressPercentage}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><MdOndemandVideo /></div>
          <div className="stat-info">
            <span className="stat-value">{progress.totalVideos}</span>
            <span className="stat-label">Total Lessons</span>
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
          {progress.completedCount} of {progress.totalVideos} lessons completed
        </span>
      </div>

      {currentVideo && (
        <div className="current-video-info">
          <span className="current-label">📍 Current Lesson:</span>
          <span className="current-title">{currentVideo.title}</span>
        </div>
      )}

      {progress.completedCount === progress.totalVideos && progress.totalVideos > 0 && (
        <div className="completion-message">
          <span className="completion-icon">🎉</span>
          <span>Congratulations! You've completed all lessons!</span>
        </div>
      )}
    </div>
  );
};

