import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Hls from 'hls.js';
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
  const [isBuffering, setIsBuffering] = useState(false);
  const hlsRef = useRef<Hls | null>(null);

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

  // Initialize HLS player when video is loaded
  useEffect(() => {
    if (!video || !videoRef.current) return;

    const videoElement = videoRef.current;
    const videoUrl = video.videoUrl;

    // Check if video is HLS (Bunny.net) or MP4 (Firebase)
    if (videoUrl.endsWith('.m3u8')) {
      // HLS video from Bunny.net
      console.log('🎬 Initializing HLS player for Bunny.net video');

      if (Hls.isSupported()) {
        // Destroy previous HLS instance if exists
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        hls.loadSource(videoUrl);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ HLS manifest loaded, ready to play');
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error('❌ Fatal HLS error:', data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('🔄 Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('🔄 Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('💥 Unrecoverable error');
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        console.log('🍎 Using native HLS support (Safari)');
        videoElement.src = videoUrl;
      }
    } else {
      // Regular MP4 video (old Firebase videos)
      console.log('🎥 Loading MP4 video');
      videoElement.src = videoUrl;
      
      // Add error event listener
      videoElement.onerror = () => {
        console.error('❌ Video load error:', {
          error: videoElement.error,
          code: videoElement.error?.code,
          message: videoElement.error?.message,
          url: videoUrl,
        });
      };
      
      videoElement.onloadeddata = () => {
        console.log('✅ MP4 video loaded successfully');
      };
    }

    // Cleanup on unmount
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [video]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !video) return;

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    if (duration > 0) {
      const percentWatched = (currentTime / duration) * 100;
      setWatchProgress(Math.round(percentWatched));
      
      // Check buffer health
      if (videoRef.current.buffered.length > 0) {
        let bufferGap = 0;
        for (let i = 0; i < videoRef.current.buffered.length; i++) {
          const start = videoRef.current.buffered.start(i);
          const end = videoRef.current.buffered.end(i);
          
          if (currentTime >= start && currentTime <= end) {
            bufferGap = end - currentTime;
            break;
          }
        }
        
        // Aggressive buffering strategy: pause if buffer is too low
        if (bufferGap < 5 && !videoRef.current.paused && !isBuffering) {
          console.log('⏸️ Pausing to buffer... (' + bufferGap.toFixed(1) + 's remaining)');
          setIsBuffering(true);
          videoRef.current.pause();
        } else if (bufferGap > 15 && isBuffering) {
          console.log('▶️ Resuming playback (buffer: ' + bufferGap.toFixed(1) + 's)');
          setIsBuffering(false);
          videoRef.current.play();
        }
      }
      
      // Auto-complete at 100%
      if (percentWatched >= 99.9 && completionStatus === 'watching') {
        markVideoComplete();
      }
    }
  };

  const handleSeeking = () => {
    console.log('⏩ User seeking to new position...');
  };

  const handleSeeked = () => {
    console.log('✅ Seek completed, resuming playback...');
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
          key={video.videoUrl}
          className="video-element"
          controls
          controlsList="nodownload"
          disablePictureInPicture
          playsInline
          poster={video.coverPhotoUrl}
          onContextMenu={(e) => e.preventDefault()}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          onSeeking={handleSeeking}
          onSeeked={handleSeeked}
          onCanPlay={() => console.log('✅ Video can play')}
          onWaiting={() => console.log('⏳ Video waiting/buffering...')}
          onPlaying={() => console.log('▶️ Video playing')}
          onStalled={() => console.log('🔴 Video stalled - network issue!')}
          onError={(e) => console.error('❌ Video error:', e)}
        >
          {/* Source will be set by HLS.js or directly for MP4 */}
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

