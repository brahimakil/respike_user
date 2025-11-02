import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { auth } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';
import './DashboardLayout.css';
import { MdMenu, MdLogout, MdLightMode, MdDarkMode } from 'react-icons/md';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await auth.signOut();
      navigate('/');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <MdMenu />
          </button>

          <div className="topbar-right">
            <button 
              className="theme-toggle" 
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <MdLightMode /> : <MdDarkMode />}
            </button>

            <div className="user-menu">
              <img 
                src={user?.photoURL || 'https://via.placeholder.com/40'} 
                alt="User" 
                className="user-avatar"
              />
              <div className="user-info">
                <span className="user-name">{user?.displayName || 'User'}</span>
                <span className="user-email">{user?.email}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <MdLogout /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};






