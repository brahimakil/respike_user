import { NavLink } from 'react-router-dom';
import { MdDashboard, MdShowChart, MdPlayLesson, MdPerson } from 'react-icons/md';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <h2>RE SPIKE</h2>
            <p>EDUCATION</p>
          </div>
          <button className="close-sidebar" onClick={onClose}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon"><MdDashboard /></span>
            <span className="nav-text">Dashboard</span>
          </NavLink>

          <NavLink 
            to="/dashboard/track" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon"><MdShowChart /></span>
            <span className="nav-text">Track</span>
          </NavLink>

          <NavLink 
            to="/dashboard/videos" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon"><MdPlayLesson /></span>
            <span className="nav-text">Lessons</span>
          </NavLink>

          <NavLink 
            to="/dashboard/profile" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon"><MdPerson /></span>
            <span className="nav-text">Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <p className="slogan">Trade with Purpose<br/>Learn with Power</p>
        </div>
      </aside>
    </>
  );
};

