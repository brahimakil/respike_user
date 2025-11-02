import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { StrategyCard } from './components/StrategyCard';
import { SubscriptionModal } from './components/SubscriptionModal';
import { CurrentSubscription } from './components/CurrentSubscription';
import './Track.css';
import { MdInfo, MdWarning } from 'react-icons/md';

interface Strategy {
  id: string;
  name: string;
  description: string;
  price: number;
  number: number; // Backend returns 'number', we'll map it
  coverPhotoURL?: string;
  expectedWeeks?: number;
  videoCount?: number;
}

interface Subscription {
  id: string;
  strategyId: string;
  strategyName: string;
  strategyPrice: number;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  price: number;
}

export const Track = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStrategies(),
        fetchSubscription(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategies = async () => {
    try {
      const response = await api.get('/strategies');
      const sortedStrategies = response.data.sort((a: Strategy, b: Strategy) => 
        a.number - b.number
      );
      setStrategies(sortedStrategies);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/my-subscription');
      // API returns null if no subscription exists or if cancelled
      
      // Handle empty string or null/undefined
      if (!response.data || response.data === '') {
        setSubscription(null);
      } else {
        setSubscription(response.data);
      }
    } catch (error: any) {
      // Handle 404 or null response gracefully
      setSubscription(null);
    }
  };

  const handleSubscribe = (strategy: Strategy) => {
    // If user has a pending subscription
    if (subscription && subscription.status === 'pending') {
      // If clicking on their current strategy, open as renewal
      if (strategy.id === subscription.strategyId) {
        handleRenew();
      } else {
        // If clicking on a different strategy, open as upgrade/switch
        setSelectedStrategy(strategy);
        setShowUpgradeModal(true);
      }
    } else {
      // Normal subscription flow for new users
      setSelectedStrategy(strategy);
      setShowSubscribeModal(true);
    }
  };

  const handleRenew = () => {
    setShowRenewModal(true);
  };

  const handleUpgrade = () => {
    // Don't preselect a strategy - let user choose
    setSelectedStrategy(null);
    setShowUpgradeModal(true);
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscribeModal(false);
    setShowRenewModal(false);
    setShowUpgradeModal(false);
    setSelectedStrategy(null);
    fetchData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="track-page">
        <div className="page-header">
          <h1>Track Progress</h1>
          <p>Loading your learning journey...</p>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="track-page">
      <div className="page-header">
        <h1>Track Progress</h1>
        <p>Subscribe to strategies and monitor your learning journey</p>
      </div>

      <div className="track-content">
        {/* Current Subscription */}
        {subscription && subscription.status !== 'cancelled' && (
          <CurrentSubscription 
            subscription={subscription} 
            onRefresh={fetchData}
            onRenew={handleRenew}
            onUpgrade={handleUpgrade}
          />
        )}

        {/* Available Strategies */}
        <section className="strategies-section">
          <div className="section-header">
            <h2>Available Strategies</h2>
            <p>Choose a strategy to begin your trading education</p>
          </div>

          {subscription?.status === 'active' && (
            <div className="info-banner">
              <span className="info-icon"><MdInfo /></span>
              <div>
                <strong>Active Subscription</strong>
                <p>You're currently subscribed to {subscription.strategyName}. You can upgrade to a higher plan or cancel anytime.</p>
              </div>
            </div>
          )}

          {subscription?.status === 'pending' && (
            <div className="warning-banner">
              <span className="warning-icon"><MdWarning /></span>
              <div>
                <strong>Subscription Expired</strong>
                <p>Your subscription has ended. Renew for $100 to continue or choose a different strategy.</p>
              </div>
            </div>
          )}

          <div className="strategies-grid">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                currentSubscription={subscription}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && selectedStrategy && (
        <SubscriptionModal
          strategy={selectedStrategy}
          onClose={() => {
            setShowSubscribeModal(false);
            setSelectedStrategy(null);
          }}
          onSuccess={handleSubscriptionSuccess}
        />
      )}

      {/* Renew Modal */}
      {showRenewModal && subscription && (
        <SubscriptionModal
          strategy={{
            id: subscription.strategyId,
            name: subscription.strategyName,
            description: '',
            price: 100, // Renewal fee
            number: 0,
            expectedWeeks: 4,
            videoCount: 0,
          }}
          onClose={() => setShowRenewModal(false)}
          onSuccess={handleSubscriptionSuccess}
          isRenewal={true}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && subscription && (
        <SubscriptionModal
          strategy={selectedStrategy}
          currentSubscription={{
            id: subscription.id,
            strategyId: subscription.strategyId,
            strategyName: subscription.strategyName,
            strategyPrice: subscription.strategyPrice,
            status: subscription.status,
          }}
          availableStrategies={strategies.filter(s => 
            s.id !== subscription.strategyId
          )}
          onClose={() => {
            setShowUpgradeModal(false);
            setSelectedStrategy(null);
          }}
          onSuccess={handleSubscriptionSuccess}
          onStrategySelect={(strategy) => setSelectedStrategy(strategy)}
          isUpgrade={true}
        />
      )}
    </div>
  );
};

