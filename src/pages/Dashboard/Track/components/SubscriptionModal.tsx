import { useState, useEffect, useRef } from 'react';
import api from '../../../../services/api';

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
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('usdttrc20');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pollingStatus, setPollingStatus] = useState('Waiting for payment...');
  const pollingIntervalRef = useRef<number | null>(null);

  // Fake wallet addresses for testing
  const testWallets = {
    usdttrc20: 'TXYZeNjmYqREXhVEnnWqZjRPzPbGr5Wgve',
    usdterc20: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Auto-polling function
  const startPaymentStatusPolling = (paymentId: string) => {
    let attempts = 0;
    const maxAttempts = 40; // 40 attempts * 15 seconds = 10 minutes

    const checkPaymentStatus = async () => {
      attempts++;
      setPollingStatus(`Checking payment status... (${attempts}/${maxAttempts})`);

      try {
        await api.post('/subscriptions/confirm-payment', { paymentId });
        
        // Payment confirmed!
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } catch (error: any) {
        // Payment not confirmed yet
        if (attempts >= maxAttempts) {
          // Max attempts reached
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setPollingStatus('⏱️ Payment timeout. Please click "Check Now" to verify manually.');
        } else {
          setPollingStatus(`⏳ Waiting for payment confirmation... (${attempts}/${maxAttempts})`);
        }
      }
    };

    // Check immediately
    checkPaymentStatus();

    // Then check every 15 seconds
    pollingIntervalRef.current = setInterval(checkPaymentStatus, 15000);
  };

  const handleInitiatePayment = async () => {
    if (isUpgrade && !strategy) {
      setError('Please select a strategy to upgrade to');
      return;
    }

    if (!isUpgrade && !strategy) {
      setError('Strategy not selected');
      return;
    }

    if (!walletAddress.trim()) {
      setError('Please enter your wallet address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;

      if (isRenewal) {
        // Renew existing subscription
        response = await api.post('/subscriptions/my-subscription/renew', {
          walletAddress: walletAddress.trim(),
          currency: selectedCurrency,
        });
      } else if (isUpgrade) {
        // Upgrade/switch to new strategy
        response = await api.post('/subscriptions/my-subscription/upgrade', {
          newStrategyId: strategy!.id,
          walletAddress: walletAddress.trim(),
          currency: selectedCurrency,
        });

        // Check if it's a downgrade (no payment required)
        if (response.data.noPaymentRequired) {
          setStep('success');
          setTimeout(() => {
            onSuccess();
          }, 2000);
          return;
        }
      } else {
        // New subscription
        response = await api.post('/subscriptions/initiate', {
          strategyId: strategy!.id,
          walletAddress: walletAddress.trim(),
          currency: selectedCurrency,
        });
      }

      setPaymentInfo(response.data);
      
      // If test mode, skip to success immediately
      if (response.data.testMode) {
        console.log('🧪 Test mode detected - auto-confirming payment...');
        
        // Auto-confirm the payment in test mode
        try {
          await api.post('/subscriptions/confirm-payment', {
            paymentId: response.data.paymentId,
          });
          
          setStep('success');
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } catch (confirmError: any) {
          console.error('Error confirming test payment:', confirmError);
          setError('Test payment confirmation failed. Please try again.');
        }
      } else {
        // Production mode - show payment screen
        setStep('payment');
        // Start auto-checking payment status every 15 seconds
        startPaymentStatusPolling(response.data.paymentId);
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      setError(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // In a real scenario, this would check payment status via webhook
      // For now, we'll simulate the payment confirmation
      await api.post('/subscriptions/confirm-payment', {
        paymentId: paymentInfo.paymentId,
      });

      setStep('success');
      
      // Auto-close and refresh after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      setError(error.response?.data?.message || 'Payment confirmation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
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

          {/* Step 1: Details & Wallet */}
          {step === 'details' && (
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
                                Strategy {s.strategyNumber}: {s.name} - ${s.price}/mo ({diffText})
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

              <div className="payment-form">
                <h3>Payment Information</h3>
                
                <div className="form-group">
                  <label>Select Cryptocurrency</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="form-select"
                  >
                    <option value="usdttrc20">USDT (TRC20)</option>
                    <option value="usdterc20">USDT (ERC20)</option>
                    <option value="btc">Bitcoin (BTC)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Your Wallet Address</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your wallet address"
                    className="form-input"
                  />
                  <small className="help-text">
                    This is the wallet you'll send payment from
                  </small>
                </div>

                <div className="test-wallet-info">
                  <p><strong>🧪 For Testing:</strong></p>
                  <p>Use this test wallet address:</p>
                  <code onClick={() => copyToClipboard(testWallets[selectedCurrency as keyof typeof testWallets])}>
                    {testWallets[selectedCurrency as keyof typeof testWallets]}
                    <span className="copy-icon">📋</span>
                  </code>
                </div>
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
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Instructions */}
          {step === 'payment' && paymentInfo && (
            <div className="step-payment">
              <div className="payment-instructions">
                <h3>Complete Your Payment</h3>
                <p>Send <strong>${strategy?.price || paymentInfo.amount}</strong> to the address below:</p>

                <div className="payment-address-box">
                  <label>Payment Address:</label>
                  <div className="address-display" onClick={() => copyToClipboard(paymentInfo.paymentAddress)}>
                    <code>{paymentInfo.paymentAddress}</code>
                    <button className="copy-btn">📋 Copy</button>
                  </div>
                </div>

                <div className="payment-amount-box">
                  <label>Exact Amount:</label>
                  <div className="amount-display">
                    <strong>${paymentInfo.amount}</strong>
                    <span className="currency">{selectedCurrency.toUpperCase()}</span>
                  </div>
                </div>

                {paymentInfo.strategyPrice !== undefined && (
                  <div className="payment-breakdown">
                    <h4>Payment Breakdown</h4>
                    <div className="breakdown-row">
                      <span>Strategy Price:</span>
                      <span>${paymentInfo.strategyPrice}</span>
                    </div>
                    {paymentInfo.coachCommission > 0 && (
                      <>
                        <div className="breakdown-row">
                          <span>Coach Commission ({paymentInfo.coachCommissionPercentage}%):</span>
                          <span>${paymentInfo.coachCommission}</span>
                        </div>
                        <div className="breakdown-row">
                          <span>System Share:</span>
                          <span>${paymentInfo.systemShare}</span>
                        </div>
                      </>
                    )}
                    <div className="breakdown-row total">
                      <span><strong>Total:</strong></span>
                      <span><strong>${paymentInfo.amount}</strong></span>
                    </div>
                  </div>
                )}

                <div className="warning-box">
                  <span className="warning-icon">⚠️</span>
                  <div>
                    <strong>Important:</strong>
                    <p>Send the exact amount from your wallet. Payment will be verified automatically.</p>
                  </div>
                </div>

                <div className="polling-status">
                  <div className="status-indicator">
                    <div className="spinner"></div>
                    <span>{pollingStatus}</span>
                  </div>
                  <p className="status-help">
                    🔄 The system automatically checks for your payment every 15 seconds. 
                    You can also click "Check Now" to verify immediately.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setStep('details')}>
                  Back
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleConfirmPayment}
                  disabled={loading}
                >
                  {loading ? 'Verifying Payment...' : 'Check Now'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="step-success">
              <div className="success-icon">✅</div>
              <h3>{isUpgrade ? 'Strategy Changed!' : 'Subscription Activated!'}</h3>
              <p>{strategy ? `Welcome to ${strategy.name}` : 'Your subscription has been updated'}</p>
              <p className="success-message">
                {isUpgrade 
                  ? 'Your strategy has been successfully updated. You can now access the new content.'
                  : 'Your subscription is now active. You can start accessing exclusive video content.'}
              </p>
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Redirecting...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

