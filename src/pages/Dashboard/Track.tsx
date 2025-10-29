import './Dashboard.css';

export const Track = () => {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Track Progress</h1>
        <p>Monitor your learning journey and achievements</p>
      </div>

      <div className="dashboard-content">
        <div className="section">
          <h2>Your Progress</h2>
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No progress data yet</h3>
            <p>Start watching videos to track your progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};






