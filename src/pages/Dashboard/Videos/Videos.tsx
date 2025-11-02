import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { VideoList } from './components/VideoList';
import { ProgressOverview } from './components/ProgressOverview';
import './Videos.css';
import { MdPlayLesson } from 'react-icons/md';

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

interface Progress {
  totalVideos: number;
  completedCount: number;
  progressPercentage: number;
  currentVideoId: string | null;
}

interface Subscription {
  id: string;
  strategyName: string;
  strategyNumber: number;
  endDate: Date;
}

export const Videos = () => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideoProgress();
  }, []);

  const fetchVideoProgress = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/subscriptions/my-subscription/video-progress');
      
      setSubscription(response.data.subscription);
      setProgress(response.data.progress);
      setVideos(response.data.videos);
    } catch (error: any) {
      console.error('Error fetching video progress:', error);
      if (error.response?.status === 400) {
        setError('You need an active subscription to access lessons');
      } else {
        setError('Failed to load lessons');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: Video) => {
    if (!video.canAccess) {
      return;
    }
    
    // Pass strategyId as state to the video player
    navigate(`/dashboard/videos/${video.id}`, { state: { strategyId: video.strategyId } });
  };

  if (loading) {
    return (
      <div className="videos-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="videos-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard/track')} className="btn-primary">
            Go to Track Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="videos-container">
      <div className="videos-header">
        <h1><MdPlayLesson style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> My Lessons</h1>
        {subscription && (
          <p className="strategy-name">
            Strategy {subscription.strategyNumber}: {subscription.strategyName}
          </p>
        )}
      </div>

      {progress && (
        <ProgressOverview
          progress={progress}
          videos={videos}
        />
      )}

      {videos.length > 0 ? (
        <VideoList
          videos={videos}
          onVideoClick={handleVideoClick}
        />
      ) : (
        <div className="empty-state">
          <p>No lessons available yet for this strategy</p>
        </div>
      )}
    </div>
  );
};

