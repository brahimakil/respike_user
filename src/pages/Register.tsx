import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';
import './Auth.css';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phoneNumber: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.phoneNumber && !formData.phoneNumber.startsWith('+')) {
      setError('Phone number must start with + and country code (e.g., +1234567890)');
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update user profile with display name
      if (formData.displayName) {
        await updateProfile(userCredential.user, {
          displayName: formData.displayName,
        });
      }

      // Create user document in Firestore via backend
      try {
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('userToken', token);
        
        await api.post('/users/create-profile', {
          displayName: formData.displayName,
          phoneNumber: formData.phoneNumber || null,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Upload profile photo if provided
        if (photoFile) {
          try {
            const photoFormData = new FormData();
            photoFormData.append('photo', photoFile);

            const photoResponse = await api.post('/users/upload-photo', photoFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            });

            // Update Firebase Auth profile with photo URL
            if (photoResponse.data.photoURL) {
              await updateProfile(userCredential.user, {
                photoURL: photoResponse.data.photoURL,
              });
            }
          } catch (photoError) {
            console.error('Error uploading photo:', photoError);
            // Continue anyway - profile photo is optional
          }
        }
      } catch (backendError) {
        console.error('Error creating user profile:', backendError);
        // Continue anyway - user is created in Firebase Auth
      }

      // Redirect directly to dashboard
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again');
      }
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
          <h2 className="auth-title">Create Your Account</h2>
          <p className="auth-subtitle">Start your journey to trading success</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Profile Photo Upload */}
            <div className="form-group" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '1rem' }}>Profile Photo (Optional)</label>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '3px dashed rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s ease',
                    backgroundImage: photoPreview ? `url(${photoPreview})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!photoPreview) {
                      e.currentTarget.style.borderColor = 'rgba(40, 180, 233, 0.8)';
                      e.currentTarget.style.backgroundColor = 'rgba(40, 180, 233, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!photoPreview) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  {!photoPreview && (
                    <span style={{ fontSize: '3rem', color: 'rgba(255, 255, 255, 0.5)' }}>📷</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-outline"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(40, 180, 233, 0.8)';
                    e.currentTarget.style.backgroundColor = 'rgba(40, 180, 233, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoFile(null);
                      setPhotoPreview('');
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      border: 'none',
                      borderRadius: '8px',
                      background: 'rgba(255, 59, 48, 0.2)',
                      color: '#ff3b30',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.2)';
                    }}
                  >
                    Remove Photo
                  </button>
                )}
                <small style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem' }}>
                  Max 5MB • JPG, PNG, or GIF
                </small>
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </div>

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
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+1234567890"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
              <small style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
                Optional. Format: +[country code][number] (e.g., +96170123456)
              </small>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-gradient btn-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="btn btn-outline btn-full">
            Login
          </Link>

          <div className="back-link">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

