import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import './VideoPlayer.css';

interface Video {
  id: string;
  title: string;
  description: string;
  videoNumber: number;
  videoUrl: string;
  coverPhotoUrl: string;
  strategyId: string;
}

export const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const strategyId = (location.state as any)?.strategyId;
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<'watching' | 'completing' | 'completed'>('watching');
  const [watchProgress, setWatchProgress] = useState(0);

  useEffect(() => {
    if (videoId) {
      validateAndLoadVideo();
    }
  }, [videoId]);

  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const validateAndLoadVideo = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate access
      const accessResponse = await api.post('/subscriptions/my-subscription/validate-video-access', {
        videoId,
      });

      if (!accessResponse.data.canAccess) {
        setError(accessResponse.data.reason || 'You cannot access this video');
        return;
      }

      // If strategyId is not passed via navigation state, get it from the video data
      let actualStrategyId = strategyId;
      if (!actualStrategyId) {
        // Fallback: fetch user's subscription to get strategyId
        const progressResponse = await api.get('/subscriptions/my-subscription/video-progress');
        actualStrategyId = progressResponse.data.subscription?.strategyId;
      }

      if (!actualStrategyId) {
        setError('Unable to load video: Strategy not found');
        return;
      }

      // Load video details with strategyId
      const videoResponse = await api.get(`/strategies/${actualStrategyId}/videos/${videoId}`);
      setVideo(videoResponse.data);
    } catch (error: any) {
      console.error('Error loading video:', error);
      setError(error.response?.data?.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !video) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    if (duration > 0) {
      const percentWatched = (currentTime / duration) * 100;
      setWatchProgress(Math.round(percentWatched));
      
      // Check buffer health to prevent stuttering
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        const bufferGap = bufferedEnd - currentTime;
        
        // If buffer is running low (less than 5 seconds ahead), slow down slightly
        if (bufferGap < 5 && bufferGap > 0) {
          // Browser will naturally handle this, just log for debugging
          console.log('⚠️ Buffer running low:', bufferGap.toFixed(2), 'seconds');
        }
      }
      
      // Auto-complete at 100%
      if (percentWatched >= 99.9 && completionStatus === 'watching') {
        markVideoComplete();
      }
    }
  };

  const markVideoComplete = async () => {
    if (isCompleting || completionStatus !== 'watching') return;

    try {
      setCompletionStatus('completing');
      setIsCompleting(true);
      
      await api.post('/subscriptions/my-subscription/complete-video', {
        videoId,
      });

      setCompletionStatus('completed');
      
      // Auto-navigate after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/videos');
      }, 2000);
    } catch (error: any) {
      console.error('Error marking video complete:', error);
      setCompletionStatus('watching');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleVideoEnd = async () => {
    // Video completion is handled by the 99.5% threshold in handleTimeUpdate
    // This ensures completion happens when video is essentially finished
    if (completionStatus === 'watching') {
      markVideoComplete();
    }
  };


  if (loading) {
    return (
      <div className="video-player-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard/videos')} className="btn-primary">
            ← Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="video-player-container">
      <div className="player-header">
        <button onClick={() => navigate('/dashboard/videos')} className="btn-back">
          ← Back to Lessons
        </button>
        <h1 className="video-title">
          Lesson {video.videoNumber}: {video.title}
        </h1>
      </div>

      {/* Live Status Indicator */}
      <div className={`video-status-bar ${completionStatus}`}>
        {completionStatus === 'watching' && (
          <div className="status-content">
            <span className="status-icon">▶️</span>
            <span className="status-text">Watching... ({watchProgress}%)</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${watchProgress}%` }}></div>
            </div>
          </div>
        )}
        {completionStatus === 'completing' && (
          <div className="status-content">
            <span className="status-icon">⏳</span>
            <span className="status-text">Marking as complete...</span>
          </div>
        )}
        {completionStatus === 'completed' && (
          <div className="status-content">
            <span className="status-icon">✅</span>
            <span className="status-text">Lesson Completed! Redirecting to lessons list...</span>
          </div>
        )}
      </div>

      <div className="player-wrapper">
        <video
          ref={videoRef}
          className="video-element"
          controls
          controlsList="nodownload"
          disablePictureInPicture
          preload="metadata"
          playsInline
          onContextMenu={(e) => e.preventDefault()}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          onLoadedMetadata={() => {
            // Once metadata is loaded, start buffering more aggressively
            if (videoRef.current) {
              videoRef.current.load();
            }
          }}
          poster={video.coverPhotoUrl}
        >
          <source src={video.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="video-details">
        <div className="video-description">
          <h3>Description</h3>
          <p>{video.description}</p>
        </div>
      </div>

    </div>
  );
};

