import './Dashboard.css';

export const Videos = () => {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>My Videos</h1>
        <p>Access your strategy videos and courses</p>
      </div>

      <div className="dashboard-content">
        <div className="section">
          <h2>Available Strategies</h2>
          <div className="empty-state">
            <div className="empty-icon">🎬</div>
            <h3>No active subscriptions</h3>
            <p>Subscribe to a strategy to access exclusive video content</p>
          </div>
        </div>
      </div>
    </div>
  );
};






