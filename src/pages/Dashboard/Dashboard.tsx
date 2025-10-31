import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Dashboard.css';

interface DashboardStats {
  hasActiveSubscription: boolean;
  strategyName: string;
  completedVideos: number;
  totalVideos: number;
  progressPercentage: number;
  subscriptionStatus: 'active' | 'pending' | 'expired' | null;
  daysRemaining: number;
}

interface TelegramSettings {
  enabled: boolean;
  type: 'personal' | 'group' | 'channel';
  link: string;
  label: string;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    hasActiveSubscription: false,
    strategyName: '',
    completedVideos: 0,
    totalVideos: 0,
    progressPercentage: 0,
    subscriptionStatus: null,
    daysRemaining: 0,
  });
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchTelegramSettings();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Use the video-progress endpoint to get real-time data
      const response = await api.get('/subscriptions/my-subscription/video-progress');
      
      if (response.data && response.data.subscription && response.data.progress) {
        const subscription = response.data.subscription;
        const progress = response.data.progress;
        
        // Calculate days remaining - handle different date formats
        let endDate: Date;
        if (subscription.endDate?._seconds) {
          // Firestore Timestamp format
          endDate = new Date(subscription.endDate._seconds * 1000);
        } else if (subscription.endDate?.seconds) {
          // Alternative Timestamp format
          endDate = new Date(subscription.endDate.seconds * 1000);
        } else {
          // Regular date string
          endDate = new Date(subscription.endDate);
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day for accurate calculation
        endDate.setHours(0, 0, 0, 0);
        
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        const isActive = daysRemaining > 0; // Consider active if there are days remaining
        
        setStats({
          hasActiveSubscription: isActive,
          strategyName: subscription.strategyName || 'N/A',
          completedVideos: progress.completedCount,
          totalVideos: progress.totalVideos,
          progressPercentage: progress.progressPercentage,
          subscriptionStatus: isActive ? 'active' : 'expired',
          daysRemaining: isNaN(daysRemaining) ? 0 : daysRemaining,
        });
      } else {
        setStats({
          hasActiveSubscription: false,
          strategyName: '',
          completedVideos: 0,
          totalVideos: 0,
          progressPercentage: 0,
          subscriptionStatus: null,
          daysRemaining: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set empty state on error
      setStats({
        hasActiveSubscription: false,
        strategyName: '',
        completedVideos: 0,
        totalVideos: 0,
        progressPercentage: 0,
        subscriptionStatus: null,
        daysRemaining: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTelegramSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data?.telegram?.enabled) {
        setTelegramSettings(response.data.telegram);
      }
    } catch (error) {
      console.error('Error fetching Telegram settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Loading your dashboard...</p>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your learning overview</p>
      </div>

      <div className="dashboard-content">
        {/* Telegram Button */}
        {telegramSettings && (
          <div className="telegram-section">
            <a
              href={telegramSettings.link}
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-button"
            >
              <span className="telegram-icon">📱</span>
              <span>{telegramSettings.label}</span>
              <span className="external-icon">↗</span>
            </a>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>Current Strategy</h3>
              <p 
                className="stat-value" 
                id="debug-stat-value"
                style={{ color: '#111827' }}
                ref={(el) => {
                  if (el) {
                    const computed = window.getComputedStyle(el);
                    console.log('🎨 Computed color for stat-value:', computed.color);
                    console.log('🎨 Computed styles:', {
                      color: computed.color,
                      fontSize: computed.fontSize,
                      fontWeight: computed.fontWeight
                    });
                  }
                }}
              >
                {stats.hasActiveSubscription ? stats.strategyName : 'None'}
              </p>
              <span className="stat-label">
                {stats.subscriptionStatus === 'active' ? '✓ Active' : 
                 stats.subscriptionStatus === 'pending' ? '⏳ Pending' : 
                 'No subscription'}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Completed Videos</h3>
              <p className="stat-value" style={{ color: '#111827' }}>
                {stats.completedVideos} / {stats.totalVideos}
              </p>
              <span className="stat-label">Total watched</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Progress</h3>
              <p className="stat-value" style={{ color: '#111827' }}>
                {stats.progressPercentage}%
              </p>
              <span className="stat-label">Overall completion</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <h3>Days Remaining</h3>
              <p className="stat-value" style={{ color: '#111827' }}>
                {stats.hasActiveSubscription ? stats.daysRemaining : 0}
              </p>
              <span className="stat-label">{stats.hasActiveSubscription ? 'Until renewal' : 'Subscribe to start'}</span>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>Quick Stats</h2>
          {stats.hasActiveSubscription ? (
            <div className="quick-stats">
              <div className="progress-bar-container">
                <div className="progress-bar-header">
                  <span>Course Progress</span>
                  <span style={{ color: '#111827' }}>
                    {stats.progressPercentage}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${stats.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="stats-summary">
                <p>
                  You've completed <strong style={{ color: '#111827' }}>
                    {stats.completedVideos}
                  </strong> out of <strong style={{ color: '#111827' }}>
                    {stats.totalVideos}
                  </strong> videos 
                  in the <strong style={{ color: '#111827' }}>
                    {stats.strategyName}
                  </strong> strategy.
                </p>
                {stats.subscriptionStatus === 'active' && stats.daysRemaining > 0 && (
                  <p className="highlight">
                    ⏰ Your subscription renews in <strong style={{ color: '#111827' }}>
                      {stats.daysRemaining}
                    </strong> day{stats.daysRemaining !== 1 ? 's' : ''}.
                  </p>
                )}
                {stats.subscriptionStatus === 'pending' && (
                  <p className="warning">
                    ⚠️ Your subscription has expired. Renew now to continue learning.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No active subscription</h3>
              <p>Subscribe to a strategy to start your learning journey</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};





