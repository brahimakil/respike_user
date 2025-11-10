import { useState } from 'react';
import api from '../../../../services/api';

interface Strategy {
  id: string;
  name: string;
  description: string;
  price: number;
  number: number; // Backend returns 'number'
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
}

interface SubscriptionModalProps {
  strategy: Strategy | null;
  currentSubscription?: Subscription;
  availableStrategies?: Strategy[];
  onClose: () => void;
  onSuccess: () => void;
  onStrategySelect?: (strategy: Strategy) => void;
  isRenewal?: boolean;
  isUpgrade?: boolean;
}

export const SubscriptionModal = ({ 
  strategy, 
  currentSubscription, 
  availableStrategies,
  onClose, 
  onSuccess, 
  onStrategySelect,
  isRenewal, 
  isUpgrade 
}: SubscriptionModalProps) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInitiatePayment = async () => {
    if (isUpgrade && !strategy) {
      setError('Please select a strategy to upgrade to');
      return;
    }

    if (!isUpgrade && !strategy) {
      setError('Strategy not selected');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;

      if (isRenewal) {
        // Renew existing subscription
        response = await api.post('/subscriptions/my-subscription/renew', {
          walletAddress: 'test_wallet',
          currency: 'usdttrc20',
        });
      } else if (isUpgrade) {
        // Upgrade/switch to new strategy
        response = await api.post('/subscriptions/my-subscription/upgrade', {
          newStrategyId: strategy!.id,
          walletAddress: 'test_wallet',
          currency: 'usdttrc20',
        });

        // Check if it's a downgrade (no payment required)
        if (response.data.noPaymentRequired) {
          onSuccess();
          return;
        }
      } else {
        // New subscription
        response = await api.post('/subscriptions/initiate', {
          strategyId: strategy!.id,
          walletAddress: 'test_wallet',
          currency: 'usdttrc20',
        });
      }

      // Subscription created instantly - redirect immediately
      console.log('✅ Subscription created!');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      setError(error.response?.data?.message || 'Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="subscription-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {isRenewal && 'Renew Subscription'}
            {isUpgrade && (strategy ? `Upgrade to ${strategy.name}` : 'Upgrade Your Plan')}
            {!isRenewal && !isUpgrade && strategy && `Subscribe to ${strategy.name}`}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="step-details">
            <div className="strategy-summary">
              <h3>
                {isRenewal && 'Renewal Details'}
                {isUpgrade && 'Upgrade Details'}
                {!isRenewal && !isUpgrade && 'Strategy Details'}
              </h3>
                
                {isUpgrade && currentSubscription && (
                  <>
                    {/* Strategy Selection Dropdown */}
                    {!strategy && availableStrategies && availableStrategies.length > 0 && (
                      <div className="form-group">
                        <label>Select New Strategy *</label>
                        <select
                          className="form-select"
                          onChange={(e) => {
                            const selectedStrategy = availableStrategies.find(s => s.id === e.target.value);
                            if (selectedStrategy && onStrategySelect) {
                              onStrategySelect(selectedStrategy);
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Choose a strategy to switch to...</option>
                          {availableStrategies.map((s) => {
                            const priceDiff = s.price - currentSubscription.strategyPrice;
                            const diffText = priceDiff > 0 
                              ? `Pay +$${priceDiff} (difference)` 
                              : priceDiff < 0 
                              ? `Pay $${s.price} (new plan price)` 
                              : `Free (Same price)`;
                            return (
                              <option key={s.id} value={s.id}>
                                Strategy {s.number}: {s.name} - ${s.price}/mo ({diffText})
                              </option>
                            );
                          })}
                        </select>
                        <small className="help-text">
                          {!strategy && 'Select a strategy to see pricing details.'}
                          {strategy && (strategy as Strategy).price !== undefined && (
                            <>
                              {(strategy as Strategy).price > currentSubscription.strategyPrice && '⬆️ Upgrade: You\'ll only pay the difference between plans.'}
                              {(strategy as Strategy).price < currentSubscription.strategyPrice && '⬇️ Downgrade: You\'ll pay the full price of the new (cheaper) plan.'}
                              {(strategy as Strategy).price === currentSubscription.strategyPrice && '🔄 Same price: Switch for free!'}
                            </>
                          )}
                        </small>
                      </div>
                    )}

                    {strategy && strategy.price !== undefined && (
                      <>
                        <div className="summary-row">
                          <span>Current Strategy:</span>
                          <strong>{currentSubscription.strategyName}</strong>
                        </div>
                        <div className="summary-row">
                          <span>Current Price:</span>
                          <strong>${currentSubscription.strategyPrice}</strong>
                        </div>
                        <div className="summary-row">
                          <span>New Strategy:</span>
                          <strong>{strategy.name}</strong>
                        </div>
                        <div className="summary-row">
                          <span>New Price:</span>
                          <strong>${strategy.price}</strong>
                        </div>
                        <div className="summary-row highlight">
                          <span>Amount to Pay:</span>
                          <strong>
                            {strategy.price > currentSubscription.strategyPrice 
                              ? `$${strategy.price - currentSubscription.strategyPrice} (Upgrade - pay difference)`
                              : strategy.price < currentSubscription.strategyPrice
                              ? `$${strategy.price} (Downgrade - pay new plan price)`
                              : '$0 (Free - Same price)'}
                          </strong>
                        </div>
                      </>
                    )}

                    {!strategy && availableStrategies && availableStrategies.length === 0 && (
                      <div className="empty-state">
                        <p>No higher-tier strategies available to upgrade to.</p>
                      </div>
                    )}
                  </>
                )}
                
                {!isUpgrade && strategy && (
                  <>
                    <div className="summary-row">
                      <span>Strategy:</span>
                      <strong>{strategy.name}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Price:</span>
                      <strong>${strategy.price}{isRenewal ? ' (Renewal Fee)' : ' / month'}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Duration:</span>
                      <strong>30 days</strong>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleInitiatePayment}
                  disabled={loading}
                >
                  {loading ? 'Creating Subscription...' : (isRenewal ? 'Renew Subscription' : isUpgrade ? 'Switch Strategy' : 'Subscribe Now')}
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

