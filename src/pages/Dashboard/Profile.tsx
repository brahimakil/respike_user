import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import api from '../../services/api';
import './Dashboard.css';

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data from backend to get phone number
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.uid) {
          const response = await api.get(`/users/${user.uid}`);
          setPhoneNumber(response.data.phoneNumber || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setMessage('');

      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/users/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reload the current user from Firebase Auth to get the updated photoURL
      if (auth.currentUser) {
        await auth.currentUser.reload();
        
        // Update local state with the new photoURL
        setUser({
          ...user!,
          photoURL: response.data.photoURL,
        });
      }

      setMessage('✅ Photo updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage('❌ Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDisplayName = async () => {
    try {
      setSaving(true);
      setMessage('');

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName,
        });

        // Update backend
        await api.put(`/users/${user?.uid}`, {
          displayName: displayName,
        });

        // Update local state
        setUser({
          ...user!,
          displayName: displayName,
        });

        setMessage('✅ Display name updated!');
        setEditing(false);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating display name:', error);
      setMessage('❌ Failed to update display name');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhoneNumber = async () => {
    try {
      setSavingPhone(true);
      setMessage('');

      // Validate phone number format (E.164 format: +[country code][number])
      if (phoneNumber && !phoneNumber.startsWith('+')) {
        setMessage('❌ Phone number must start with + and country code (e.g., +1234567890)');
        setSavingPhone(false);
        return;
      }

      // Update backend
      await api.put(`/users/${user?.uid}`, {
        phoneNumber: phoneNumber || null,
      });

      setMessage('✅ Phone number updated!');
      setEditingPhone(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error updating phone number:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update phone number';
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="dashboard-content">
        <div className="section">
          <h2>Account Information</h2>
          
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="profile-info">
            <div className="profile-avatar-section">
              <img 
                src={user?.photoURL || 'https://via.placeholder.com/120'} 
                alt="Profile" 
                className="profile-avatar-large"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                className="btn-upload-photo"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? '⏳ Uploading...' : '📷 Change Photo'}
              </button>
            </div>
            
            <div className="profile-details">
              <div className="detail-row">
                <label>Display Name</label>
                {editing ? (
                  <div className="edit-field">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="edit-input"
                      placeholder="Enter your name"
                    />
                    <div className="edit-actions">
                      <button
                        className="btn-save"
                        onClick={handleSaveDisplayName}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          setEditing(false);
                          setDisplayName(user?.displayName || '');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="display-field">
                    <p>{user?.displayName || 'Not set'}</p>
                    <button
                      className="btn-edit"
                      onClick={() => setEditing(true)}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="detail-row">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="detail-row">
                <label>Phone Number</label>
                {editingPhone ? (
                  <div className="edit-field">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="edit-input"
                      placeholder="+1234567890"
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Format: +[country code][number] (e.g., +96170123456)
                    </small>
                    <div className="edit-actions">
                      <button
                        className="btn-save"
                        onClick={handleSavePhoneNumber}
                        disabled={savingPhone}
                      >
                        {savingPhone ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => {
                          setEditingPhone(false);
                          // Reset to original value from backend
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="display-field">
                    <p>{phoneNumber || 'Not set'}</p>
                    <button
                      className="btn-edit"
                      onClick={() => setEditingPhone(true)}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}
              </div>
              <div className="detail-row">
                <label>User ID</label>
                <p className="user-id">{user?.uid}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};





