import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../config/firebase';
import './Auth.css';

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
      setMessage('Please login again to resend verification email');
      return;
    }

    setResending(true);
    setMessage('');

    try {
      await sendEmailVerification(auth.currentUser);
      setMessage('✅ Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending email:', error);
      if (error.code === 'auth/too-many-requests') {
        setMessage('❌ Too many requests. Please wait a few minutes before trying again.');
      } else {
        setMessage('❌ Failed to send email. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = () => {
    // Reload user to check if email is verified
    auth.currentUser?.reload().then(() => {
      if (auth.currentUser?.emailVerified) {
        navigate('/login');
      } else {
        setMessage('❌ Email not verified yet. Please check your inbox and click the verification link.');
      }
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="gradient-text">RE SPIKE EDUCATION</h1>
          <p className="slogan">TRADE WITH PURPOSE LEARN WITH POWER</p>
        </div>

        <div className="auth-card verification-card fade-in">
          <div className="verification-icon">📧</div>
          <h2 className="auth-title">Verify Your Email</h2>
          <p className="auth-subtitle">
            We've sent a verification link to <strong style={{ color: 'var(--accent-cyan)' }}>{email}</strong>
          </p>

          {message && (
            <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
              {message}
            </div>
          )}

          <div className="verification-steps">
            <ol>
              <li>Check your email inbox for a message from RE SPIKE Education</li>
              <li>Click the verification link in the email</li>
              <li>Return here and click "Continue to Login"</li>
            </ol>
          </div>

          <div className="verification-actions">
            <button 
              className="btn btn-gradient btn-full"
              onClick={handleCheckVerification}
            >
              I've Verified - Continue to Login
            </button>

            <button 
              className="btn btn-outline btn-full"
              onClick={handleResendEmail}
              disabled={resending}
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>

          <div className="resend-text">
            Didn't receive the email? Check your spam folder or{' '}
            <span className="resend-link" onClick={handleResendEmail}>
              click here to resend
            </span>
          </div>

          <div className="back-link">
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

