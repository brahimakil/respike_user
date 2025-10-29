import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import './Auth.css';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later');
      } else {
        setError('Failed to send reset email. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card forgot-password-card fade-in">
            <div className="success-icon">✅</div>
            <h2 className="auth-title">Check Your Email</h2>
            <p className="auth-subtitle">
              We've sent password reset instructions to <strong style={{ color: 'var(--accent-cyan)' }}>{email}</strong>
            </p>

            <div className="verification-steps">
              <ol>
                <li>Check your email inbox</li>
                <li>Click the password reset link</li>
                <li>Create a new password</li>
                <li>Login with your new password</li>
              </ol>
            </div>

            <Link to="/login" className="btn btn-gradient btn-full">
              Back to Login
            </Link>

            <div className="resend-text">
              Didn't receive the email? Check your spam folder
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="gradient-text">RE SPIKE EDUCATION</h1>
          <p className="slogan">TRADE WITH PURPOSE LEARN WITH POWER</p>
        </div>

        <div className="auth-card forgot-password-card fade-in">
          <div className="forgot-icon">🔒</div>
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">
            No worries! Enter your email and we'll send you reset instructions
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="reset-info">
            💡 You'll receive an email with a link to reset your password
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-gradient btn-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Remember your password?</span>
          </div>

          <Link to="/login" className="btn btn-outline btn-full">
            Back to Login
          </Link>

          <div className="back-link">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

