import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useAuthStore } from './store/authStore';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Track } from './pages/Dashboard/Track/Track';
import { Videos } from './pages/Dashboard/Videos/Videos';
import { VideoPlayer } from './pages/Dashboard/Videos/VideoPlayer';
import { Profile } from './pages/Dashboard/Profile';
import './App.css';

function App() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('userToken', token);
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        localStorage.removeItem('userToken');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={user ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="track" element={<Track />} />
          <Route path="videos" element={<Videos />} />
          <Route path="videos/:videoId" element={<VideoPlayer />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
