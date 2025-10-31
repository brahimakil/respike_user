import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Landing.css';

interface Strategy {
  id: string;
  name: string;
  description: string;
  price: number;
  coverPhotoURL?: string;
  strategyNumber: number;
  expectedPeriodWeeks: number;
  videoCount: number;
}

interface BannerSettings {
  imageUrl: string;
  text: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  overlayEnabled: boolean;
  overlayColor: string;
  overlayOpacity: number;
}

export const Landing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bannerSettings, setBannerSettings] = useState<BannerSettings>({
    imageUrl: '',
    text: 'Master Trading with RE SPIKE',
    textColor: '#ffffff',
    fontSize: 48,
    fontFamily: 'Inter, sans-serif',
    overlayEnabled: true,
    overlayColor: '#000000',
    overlayOpacity: 0.4,
  });

  // Hardcoded strategies matching the design
  const strategies = [
    {
      id: '1',
      name: 'Booster',
      price: 299,
      features: [
        { text: 'Power Entry', included: true },
        { text: 'Push Entry', included: true },
        { text: 'Weekly Meetings', included: true },
        { text: 'Daily Pro Analysis', included: true },
        { text: 'Signals', included: true },
        { text: 'Sway Entry', included: false },
        { text: 'Speed Entry', included: false },
        { text: 'Deep Analysis', included: false },
        { text: 'RE Scalp Strategy', included: false },
      ],
      gradient: 'gradient-booster',
    },
    {
      id: '2',
      name: 'Prime',
      price: 599,
      features: [
        { text: 'Power Entry', included: true },
        { text: 'Push Entry', included: true },
        { text: 'Sway Entry', included: true },
        { text: 'Daily Pro Analysis', included: true },
        { text: 'Signals', included: true },
        { text: 'Daily Coach Help', included: true },
        { text: 'Daily Meetings', included: true },
        { text: 'Speed Entry', included: false },
        { text: 'Deep Analysis', included: false },
        { text: 'RE Scalp Strategy', included: false },
      ],
      gradient: 'gradient-prime',
    },
    {
      id: '3',
      name: 'Ace',
      price: 999,
      features: [
        { text: 'Power Entry', included: true },
        { text: 'Push Entry', included: true },
        { text: 'Speed Entry', included: true },
        { text: 'Daily Coach Support', included: true },
        { text: 'Daily Meetings with Expert', included: true },
        { text: 'Daily Pro Analysis', included: true },
        { text: 'Signals', included: true },
        { text: 'RE Scalp Strategy', included: true },
        { text: 'Deep Analysis', included: true },
      ],
      gradient: 'gradient-ace',
    },
  ];

  useEffect(() => {
    fetchBannerSettings();
    setLoading(false);
  }, []);

  const fetchBannerSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data.banner) {
        setBannerSettings(response.data.banner);
      }
    } catch (error) {
      console.error('Error fetching banner settings:', error);
    }
  };

  const handleStartLearning = () => {
    // Check if user is logged in (you can check localStorage or auth state)
    const isLoggedIn = localStorage.getItem('userToken');
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="container nav-container">
          <div className="logo">
            <h1 className="gradient-text">RE SPIKE EDUCATION</h1>
            <p className="slogan">TRADE WITH PURPOSE LEARN WITH POWER</p>
          </div>
          <div className="nav-buttons">
            <button className="btn btn-outline" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Dynamic Banner */}
      <section className="hero-section" style={{
        backgroundImage: bannerSettings.imageUrl ? `url(${bannerSettings.imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}>
        {bannerSettings.imageUrl && bannerSettings.overlayEnabled && (
          <div 
            className="hero-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: bannerSettings.overlayColor,
              opacity: bannerSettings.overlayOpacity,
            }}
          />
        )}
        <div className="hero-cta-bottom-right">
          <button className="btn btn-gradient btn-lg" onClick={() => navigate('/register')}>
            GET STARTED
          </button>
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <div className="hero-content fade-in">
            <h2 className="hero-title" style={{
              color: bannerSettings.imageUrl ? bannerSettings.textColor : undefined,
              fontSize: bannerSettings.imageUrl ? `${bannerSettings.fontSize}px` : undefined,
              fontFamily: bannerSettings.imageUrl ? bannerSettings.fontFamily : undefined,
            }}>
              {bannerSettings.text}
            </h2>
            {!bannerSettings.imageUrl && (
              <p className="hero-subtitle">
                A professional trading framework built to help you master precision, psychology, and consistency
              </p>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <h2 className="section-title fade-in">ABOUT RE SPIKE EDUCATION</h2>
            <p className="about-description fade-in">
              RE SPIKE is a professional trading framework built to help traders master precision, psychology, 
              and consistency. Focused on smart money concepts and deep market structure, it empowers traders 
              to think logically, act strategically, and trade confidently. RE STRATEGY isn't just a system - 
              it's a mindset designed to create real, long-term success in Forex, Gold, and Crypto markets.
            </p>
          </div>
        </div>
      </section>

      {/* Strategies Section */}
      <section className="strategies-section">
        <div className="container">
          <h2 className="section-title fade-in">RE SPIKE PACKAGES</h2>

          <div className="strategies-container">
            {strategies.map((strategy, index) => (
              <div key={strategy.id} className={`strategy-card ${strategy.gradient} fade-in`} style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="strategy-header">
                  <h3 className="package-name">{strategy.name}</h3>
                  <div className="package-price">${strategy.price}</div>
                </div>
                
                <div className="package-subtitle">RE SPIKE EDUCATION</div>
                
                <div className="features-list">
                  {strategy.features.map((feature, idx) => (
                    <div key={idx} className={`feature-item ${!feature.included ? 'feature-excluded' : ''}`}>
                      <span className="feature-icon">{feature.included ? '✓' : '✕'}</span>
                      <span className="feature-text">{feature.text}</span>
                    </div>
                  ))}
                </div>
                
                <button className="btn btn-gradient btn-full" onClick={handleStartLearning}>
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <h2 className="section-title fade-in">LEARN MORE ABOUT US</h2>
            
            <div className="contact-info">
              <div className="contact-item fade-in">
                <svg className="contact-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                </svg>
                <a href="mailto:sup.royaleagle.lb@gmail.com" className="contact-link">
                  sup.royaleagle.lb@gmail.com
                </a>
              </div>
              
              <div className="social-links fade-in">
                <a href="#" className="social-link" target="_blank" rel="noopener noreferrer">
                  <svg className="social-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2C22 17.7383 21.3889 19.2135 20.3012 20.3012C19.2135 21.3889 17.7383 22 16.2 22H7.8C4.6 22 2 19.4 2 16.2V7.8C2 6.26174 2.61107 4.78649 3.69878 3.69878C4.78649 2.61107 6.26174 2 7.8 2ZM7.6 4C6.64522 4 5.72955 4.37928 5.05442 5.05442C4.37928 5.72955 4 6.64522 4 7.6V16.4C4 18.39 5.61 20 7.6 20H16.4C17.3548 20 18.2705 19.6207 18.9456 18.9456C19.6207 18.2705 20 17.3548 20 16.4V7.6C20 5.61 18.39 4 16.4 4H7.6ZM17.25 5.5C17.5815 5.5 17.8995 5.6317 18.1339 5.86612C18.3683 6.10054 18.5 6.41848 18.5 6.75C18.5 7.08152 18.3683 7.39946 18.1339 7.63388C17.8995 7.8683 17.5815 8 17.25 8C16.9185 8 16.6005 7.8683 16.3661 7.63388C16.1317 7.39946 16 7.08152 16 6.75C16 6.41848 16.1317 6.10054 16.3661 5.86612C16.6005 5.6317 16.9185 5.5 17.25 5.5ZM12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7ZM12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9Z" fill="currentColor"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a href="#" className="social-link" target="_blank" rel="noopener noreferrer">
                  <svg className="social-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.01C14.25 17.06 13.81 16.62 13.25 16.24C12.37 15.65 11.87 15.26 11.02 14.7C10.03 14.04 10.67 13.65 11.24 13.07C11.39 12.92 13.95 10.59 14 10.38C14.0069 10.3501 14.006 10.3189 13.9973 10.2894C13.9886 10.2599 13.9724 10.2332 13.95 10.212C13.89 10.16 13.81 10.18 13.74 10.19C13.65 10.21 12.25 11.16 9.52 13.03C9.12 13.3 8.76 13.43 8.44 13.42C8.08 13.41 7.4 13.21 6.89 13.03C6.26 12.82 5.77 12.71 5.81 12.36C5.83 12.18 6.08 12 6.55 11.82C9.47 10.54 11.41 9.69 12.38 9.26C15.16 8.09 15.73 7.89 16.11 7.89C16.19 7.89 16.38 7.91 16.5 8.01C16.6 8.09 16.63 8.21 16.64 8.3C16.63 8.37 16.65 8.66 16.64 8.8Z" fill="currentColor"/>
                  </svg>
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="gradient-text footer-logo">RE SPIKE EDUCATION</h3>
              <p className="footer-slogan">TRADE WITH PURPOSE LEARN WITH POWER</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Quick Links</h4>
                <a href="#about" onClick={(e) => { e.preventDefault(); document.querySelector('.about-section')?.scrollIntoView({ behavior: 'smooth' }); }}>About</a>
                <a href="#packages" onClick={(e) => { e.preventDefault(); document.querySelector('.strategies-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Packages</a>
                <a href="#contact" onClick={(e) => { e.preventDefault(); document.querySelector('.contact-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
              </div>
              
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Refund Policy</a>
              </div>
              
              <div className="footer-column">
                <h4>Connect</h4>
                <a href="mailto:sup.royaleagle.lb@gmail.com">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                  </svg>
                  Email
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2C22 17.7383 21.3889 19.2135 20.3012 20.3012C19.2135 21.3889 17.7383 22 16.2 22H7.8C4.6 22 2 19.4 2 16.2V7.8C2 6.26174 2.61107 4.78649 3.69878 3.69878C4.78649 2.61107 6.26174 2 7.8 2ZM7.6 4C6.64522 4 5.72955 4.37928 5.05442 5.05442C4.37928 5.72955 4 6.64522 4 7.6V16.4C4 18.39 5.61 20 7.6 20H16.4C17.3548 20 18.2705 19.6207 18.9456 18.9456C19.6207 18.2705 20 17.3548 20 16.4V7.6C20 5.61 18.39 4 16.4 4H7.6ZM17.25 5.5C17.5815 5.5 17.8995 5.6317 18.1339 5.86612C18.3683 6.10054 18.5 6.41848 18.5 6.75C18.5 7.08152 18.3683 7.39946 18.1339 7.63388C17.8995 7.8683 17.5815 8 17.25 8C16.9185 8 16.6005 7.8683 16.3661 7.63388C16.1317 7.39946 16 7.08152 16 6.75C16 6.41848 16.1317 6.10054 16.3661 5.86612C16.6005 5.6317 16.9185 5.5 17.25 5.5ZM12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7ZM12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9Z" fill="currentColor"/>
                  </svg>
                  Instagram
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.01C14.25 17.06 13.81 16.62 13.25 16.24C12.37 15.65 11.87 15.26 11.02 14.7C10.03 14.04 10.67 13.65 11.24 13.07C11.39 12.92 13.95 10.59 14 10.38C14.0069 10.3501 14.006 10.3189 13.9973 10.2894C13.9886 10.2599 13.9724 10.2332 13.95 10.212C13.89 10.16 13.81 10.18 13.74 10.19C13.65 10.21 12.25 11.16 9.52 13.03C9.12 13.3 8.76 13.43 8.44 13.42C8.08 13.41 7.4 13.21 6.89 13.03C6.26 12.82 5.77 12.71 5.81 12.36C5.83 12.18 6.08 12 6.55 11.82C9.47 10.54 11.41 9.69 12.38 9.26C15.16 8.09 15.73 7.89 16.11 7.89C16.19 7.89 16.38 7.91 16.5 8.01C16.6 8.09 16.63 8.21 16.64 8.3C16.63 8.37 16.65 8.66 16.64 8.8Z" fill="currentColor"/>
                  </svg>
                  Telegram
                </a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 RE SPIKE EDUCATION. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

