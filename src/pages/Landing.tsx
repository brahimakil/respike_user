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
  const [strategies, setStrategies] = useState<Strategy[]>([]);
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

  useEffect(() => {
    fetchStrategies();
    fetchBannerSettings();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await api.get('/strategies');
      // Sort by strategy number
      const sortedStrategies = response.data.sort((a: Strategy, b: Strategy) => 
        a.strategyNumber - b.strategyNumber
      );
      setStrategies(sortedStrategies);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getGradientClass = (index: number) => {
    const gradients = ['gradient-booster', 'gradient-prime', 'gradient-ace'];
    return gradients[index % gradients.length];
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
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-content fade-in">
            <h2 className="hero-title" style={{
              color: bannerSettings.imageUrl ? bannerSettings.textColor : undefined,
              fontSize: bannerSettings.imageUrl ? `${bannerSettings.fontSize}px` : undefined,
              fontFamily: bannerSettings.imageUrl ? bannerSettings.fontFamily : undefined,
            }}>
              {bannerSettings.text || 'Master Trading with RE SPIKE'}
            </h2>
            {!bannerSettings.imageUrl && (
              <p className="hero-subtitle">
                A professional trading framework built to help you master precision, psychology, and consistency
              </p>
            )}
            <button className="btn btn-gradient btn-lg" onClick={() => navigate('/register')}>
              GET STARTED
            </button>
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
          <h2 className="section-title fade-in">Our Trading Strategies</h2>
          <p className="section-subtitle fade-in">
            Choose the perfect plan to accelerate your trading journey
          </p>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading strategies...</p>
            </div>
          ) : (
            <div className="strategies-container">
              {strategies.map((strategy, index) => (
                <div key={strategy.id} className="strategy-wrapper">
                  {/* Strategy Card */}
                  <div className={`strategy-card ${getGradientClass(index)} fade-in`} style={{ animationDelay: `${index * 0.2}s` }}>
                    <div className="strategy-number">Strategy {strategy.strategyNumber}</div>
                    
                    {strategy.coverPhotoURL && (
                      <div className="strategy-image">
                        <img src={strategy.coverPhotoURL} alt={strategy.name} />
                      </div>
                    )}
                    
                    <div className="strategy-content">
                      <h3 className="strategy-name">{strategy.name}</h3>
                      <p className="strategy-description">{strategy.description}</p>
                      
                      <div className="strategy-details">
                        <div className="detail-item">
                          <span className="detail-icon">📚</span>
                          <span>{strategy.videoCount} Videos</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">⏱️</span>
                          <span>{strategy.expectedPeriodWeeks} Weeks</span>
                        </div>
                      </div>
                      
                      <div className="strategy-price">
                        <span className="price-amount">${strategy.price}</span>
                        <span className="price-label">/ month</span>
                      </div>
                      
                      <button className="btn btn-gradient btn-full" onClick={() => navigate('/register')}>
                        Start Learning
                      </button>
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < strategies.length - 1 && (
                    <div className="strategy-arrow">
                      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <path
                          d="M15 30H45M45 30L35 20M45 30L35 40"
                          stroke="var(--accent-cyan)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="arrow-label">Level Up</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <h2 className="section-title fade-in">LEARN MORE ABOUT US</h2>
            
            <div className="contact-info">
              <div className="contact-item fade-in">
                <span className="contact-icon">📧</span>
                <a href="mailto:sup.royaleagle.lb@gmail.com" className="contact-link">
                  sup.royaleagle.lb@gmail.com
                </a>
              </div>
              
              <div className="social-links fade-in">
                <a href="#" className="social-link">
                  <span className="social-icon">📸</span>
                  <span>Instagram</span>
                </a>
                <a href="#" className="social-link">
                  <span className="social-icon">✈️</span>
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
          <p>&copy; 2025 RE SPIKE EDUCATION. All rights reserved.</p>
          <p className="gradient-text">TRADE WITH PURPOSE LEARN WITH POWER</p>
        </div>
      </footer>
    </div>
  );
};

