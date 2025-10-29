import { useState } from 'react';
import api from '../../../../services/api';

interface Subscription {
  id: string;
  strategyId: string;
  strategyName: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  price: number;
}

interface CurrentSubscriptionProps {
  subscription: Subscription;
  onRefresh: () => void;
  onRenew: () => void;
  onUpgrade: () => void;
}

export const CurrentSubscription = ({ subscription, onRefresh, onRenew, onUpgrade }: CurrentSubscriptionProps) => {
  const [showDetails, setShowDetails] = useState(true);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'pending': return 'status-pending';
      case 'expired': return 'status-expired';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '✓ Active';
      case 'pending': return '⏳ Pending Renewal';
      case 'expired': return '✕ Expired';
      case 'cancelled': return '✕ Cancelled';
      default: return status;
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access immediately.')) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/subscriptions/my-subscription/cancel');
      alert('✅ Subscription cancelled successfully');
      onRefresh();
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      alert(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const getRemainingDays = () => {
    const end = new Date(subscription.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const remainingDays = getRemainingDays();

  return (
    <section className="current-subscription">
      <div className="subscription-header">
        <h2>Current Subscription</h2>
        <button 
          className="toggle-details"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '−' : '+'}
        </button>
      </div>

      {showDetails && (
        <div className="subscription-details">
          <div className="subscription-card">
            <div className="subscription-info">
              <h3>{subscription.strategyName}</h3>
              <span className={`subscription-status ${getStatusColor(subscription.status)}`}>
                {getStatusLabel(subscription.status)}
              </span>
            </div>

            <div className="subscription-stats">
              <div className="stat">
                <label>Start Date</label>
                <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
              </div>
              <div className="stat">
                <label>End Date</label>
                <p>{new Date(subscription.endDate).toLocaleDateString()}</p>
              </div>
              <div className="stat">
                <label>Renewal Cost</label>
                <p>$100</p>
              </div>
              <div className="stat">
                <label>Remaining</label>
                <p className={remainingDays <= 7 ? 'text-warning' : ''}>
                  {remainingDays > 0 ? `${remainingDays} days` : 'Expired'}
                </p>
              </div>
            </div>

            {subscription.status === 'pending' && (
              <div className="renewal-notice">
                <span className="notice-icon">⚠️</span>
                <div>
                  <strong>Renewal Required</strong>
                  <p>Your subscription has ended. Please renew to continue accessing videos.</p>
                </div>
              </div>
            )}

            {subscription.status === 'active' && remainingDays <= 7 && (
              <div className="expiry-notice">
                <span className="notice-icon">⏰</span>
                <div>
                  <strong>Expiring Soon</strong>
                  <p>Your subscription will expire in {remainingDays} day{remainingDays !== 1 ? 's' : ''}.</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="subscription-actions">
              {subscription.status === 'active' && (
                <>
                  <button 
                    className="btn-action btn-upgrade"
                    onClick={onUpgrade}
                    disabled={loading}
                  >
                    ⬆️ Upgrade Plan
                  </button>
                  <button 
                    className="btn-action btn-cancel"
                    onClick={handleCancelSubscription}
                    disabled={loading}
                  >
                    {loading ? 'Cancelling...' : '✕ Cancel Subscription'}
                  </button>
                </>
              )}

              {subscription.status === 'pending' && (
                <button 
                  className="btn-action btn-renew"
                  onClick={onRenew}
                  disabled={loading}
                >
                  🔄 Renew Subscription ($100)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

