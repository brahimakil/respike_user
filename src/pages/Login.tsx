import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import './Auth.css';

export const Login = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔵 Calling backend API to login user...');
      
      // Call backend API to verify user login
      const response = await api.post('/auth/user/login', {
        email: formData.email,
        password: formData.password,
      });
      
      console.log('✅ Backend response:', response.data);
      
      const { token } = response.data;
      
      if (!token) {
        throw new Error('No token received from backend');
      }
      
      console.log('🔵 Signing in with custom token...');
      // Sign in with the custom token from backend
      const userCredential = await signInWithCustomToken(auth, token);
      console.log('✅ Successfully signed in as user:', userCredential.user.uid);

      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem('userToken', idToken);

      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ User login error:', error);
      
      // Handle specific error messages
      if (error.response?.status === 401) {
        setError('Invalid credentials or insufficient permissions. User accounts only.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to login. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="gradient-text">RE SPIKE EDUCATION</h1>
          <p className="slogan">TRADE WITH PURPOSE LEARN WITH POWER</p>
        </div>

        <div className="auth-card fade-in">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to continue your trading journey</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="form-footer">
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn btn-gradient btn-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Don't have an account?</span>
          </div>

          <Link to="/register" className="btn btn-outline btn-full">
            Create Account
          </Link>

          <div className="back-link">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

