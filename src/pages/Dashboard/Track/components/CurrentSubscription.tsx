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
  const [showCancelModal, setShowCancelModal] = useState(false);

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
    setLoading(true);
    try {
      await api.post('/subscriptions/my-subscription/cancel');
      setShowCancelModal(false);
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
                <>
                  <button 
                    className="btn-action btn-renew"
                    onClick={onRenew}
                    disabled={loading}
                  >
                    🔄 Renew Subscription ($100)
                  </button>
                  <button 
                    className="btn-action btn-cancel"
                    onClick={() => setShowCancelModal(true)}
                    disabled={loading}
                    style={{ marginTop: '10px' }}
                  >
                    ✕ Cancel Subscription
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '500px',
            padding: '0',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              color: 'white',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                IMPORTANT WARNING
              </h2>
            </div>

            {/* Content */}
            <div style={{ padding: '32px 24px', background: 'white' }}>
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.6', 
                marginBottom: '24px',
                color: '#000',
                fontWeight: '500'
              }}>
                Canceling your subscription will have the following consequences:
              </p>

              <div style={{
                background: '#fff8e1',
                border: '2px solid #ff9800',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: '2',
                  color: '#000'
                }}>
                  <li style={{ marginBottom: '12px', color: '#000' }}>
                    <span style={{ color: '#dc3545', fontWeight: '700', fontSize: '18px' }}>✕</span>
                    {' '}Your current track will <strong style={{ color: '#000' }}>end completely</strong>
                  </li>
                  <li style={{ marginBottom: '12px', color: '#000' }}>
                    <span style={{ color: '#dc3545', fontWeight: '700', fontSize: '18px' }}>✕</span>
                    {' '}Your watch history and progress will be <strong style={{ color: '#000' }}>removed</strong>
                  </li>
                  <li style={{ marginBottom: '12px', color: '#000' }}>
                    <span style={{ color: '#dc3545', fontWeight: '700', fontSize: '18px' }}>✕</span>
                    {' '}You will <strong style={{ color: '#000' }}>LOSE the ability to pay less</strong> for upgrading to higher plans
                  </li>
                  <li style={{ color: '#000' }}>
                    <span style={{ color: '#dc3545', fontWeight: '700', fontSize: '18px' }}>✕</span>
                    {' '}You will need to <strong style={{ color: '#000' }}>start fresh</strong> if you subscribe again
                  </li>
                </ul>
              </div>

              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#dc3545',
                textAlign: 'center',
                marginBottom: '24px'
              }}>
                Are you absolutely sure you want to cancel?
              </p>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#218838'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#28a745'}
                >
                  ← Keep My Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#c82333')}
                  onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#dc3545')}
                >
                  {loading ? 'Cancelling...' : 'Yes, Cancel Forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

