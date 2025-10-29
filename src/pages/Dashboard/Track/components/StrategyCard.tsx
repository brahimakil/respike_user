interface Strategy {
  id: string;
  name: string;
  description: string;
  price: number;
  strategyNumber: number;
  coverPhotoURL?: string;
  expectedPeriodWeeks?: number;
  videoCount?: number;
}

interface Subscription {
  id: string;
  strategyId: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
}

interface StrategyCardProps {
  strategy: Strategy;
  currentSubscription: Subscription | null;
  onSubscribe: (strategy: Strategy) => void;
}

export const StrategyCard = ({ strategy, currentSubscription, onSubscribe }: StrategyCardProps) => {
  const isSubscribed = currentSubscription?.strategyId === strategy.id;
  const hasActiveSubscription = currentSubscription?.status === 'active';
  const hasPendingSubscription = currentSubscription?.status === 'pending';
  // User can subscribe if: no subscription, OR pending subscription (can switch/renew), OR clicking their current strategy
  // But CANNOT subscribe to other plans if they have an ACTIVE subscription
  const canSubscribe = !hasActiveSubscription || hasPendingSubscription || isSubscribed;

  return (
    <div className={`strategy-card ${isSubscribed ? 'subscribed' : ''}`}>
      <div className="strategy-badge">Strategy {strategy.strategyNumber}</div>
      
      {strategy.coverPhotoURL && (
        <div className="strategy-image">
          <img src={strategy.coverPhotoURL} alt={strategy.name} />
        </div>
      )}
      
      <div className="strategy-body">
        <h3>{strategy.name}</h3>
        <p className="strategy-desc">{strategy.description}</p>
        
        <div className="strategy-meta">
          <div className="meta-item">
            <span className="meta-icon">🎬</span>
            <span>{strategy.videoCount} Videos</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span>{strategy.expectedPeriodWeeks} Weeks</span>
          </div>
        </div>
        
        <div className="strategy-price">
          <span className="price-amount">${strategy.price}</span>
          <span className="price-period">/ month</span>
        </div>
        
        {isSubscribed && currentSubscription?.status === 'active' && (
          <div className="subscribed-badge">
            <span className="badge-icon">✓</span>
            <span>Active Subscription</span>
          </div>
        )}
        
        {isSubscribed && currentSubscription?.status === 'pending' && (
          <div className="pending-badge">
            <span className="badge-icon">⏳</span>
            <span>Pending Renewal</span>
          </div>
        )}
        
        {!isSubscribed && (
          <button 
            className="btn-subscribe"
            onClick={() => onSubscribe(strategy)}
            disabled={!canSubscribe}
          >
            {hasPendingSubscription 
              ? 'Switch to This Plan' 
              : canSubscribe 
                ? 'Subscribe Now' 
                : 'Complete Your Active Subscription First'}
          </button>
        )}
        
        {isSubscribed && hasPendingSubscription && (
          <button 
            className="btn-subscribe btn-renew-pending"
            onClick={() => onSubscribe(strategy)}
          >
            Renew Subscription
          </button>
        )}
      </div>
    </div>
  );
};

