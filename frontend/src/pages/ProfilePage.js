// frontend/src/pages/ProfilePage.js
import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import '../App.css';

// Dynamic backend URL (same as used in other pages)
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://thefolio-mpb8.onrender.com' 
  : 'http://localhost:5000';

function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.profilePic 
      ? `${BACKEND_URL}/uploads/${user.profilePic}` 
      : '/default-avatar.png'
  );
  const [uploading, setUploading] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        setError('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  // Save profile picture only (without updating name/bio)
  const handleSaveProfilePic = async () => {
    if (!profilePic) {
      setError('Please select an image first');
      return;
    }
    setUploadingPic(true);
    setError('');
    setMessage('');

    const formDataToSend = new FormData();
    formDataToSend.append('profilePic', profilePic);

    try {
      const { data } = await API.put('/auth/profile', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setUser(data);
      setMessage('Profile picture updated successfully');
      
      // Clear the file input and reset local preview to server URL
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProfilePic(null);
      // Update preview to the server URL (new image)
      setPreviewUrl(`${BACKEND_URL}/uploads/${data.profilePic}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload picture');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setUploading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('bio', formData.bio);
    if (profilePic) {
      formDataToSend.append('profilePic', profilePic);
    }

    try {
      const { data } = await API.put('/auth/profile', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setUser(data);
      setMessage('Profile updated successfully');
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProfilePic(null);
      // Update preview URL in case the profile picture changed
      if (data.profilePic) {
        setPreviewUrl(`${BACKEND_URL}/uploads/${data.profilePic}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await API.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      setMessage('Password changed successfully');
      setFormData({ 
        ...formData, 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '' 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">My Profile</h1>
      
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Profile Picture Section */}
      <section className="profile-picture-section">
        <h2>Profile Picture</h2>
        <div className="profile-picture-container">
          <img 
            src={previewUrl} 
            alt="Profile" 
            className="profile-picture-large"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
          
          <div className="profile-picture-upload">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/gif"
              className="file-input"
              id="profile-picture-input"
            />
            <label htmlFor="profile-picture-input" className="btn btn-secondary">
              Choose Image
            </label>
            {profilePic && (
              <button 
                type="button" 
                onClick={handleSaveProfilePic}
                className="btn btn-primary"
                disabled={uploadingPic}
                style={{ marginLeft: '10px' }}
              >
                {uploadingPic ? 'Saving...' : 'Save Picture'}
              </button>
            )}
          </div>
          
          <p className="file-info">Supported: JPG, PNG, GIF (Max 5MB)</p>
        </div>
      </section>

      {/* Update Profile Section */}
      <section className="profile-section">
        <h2>Update Profile</h2>
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name"
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea 
              id="bio"
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              rows="4"
              className="form-textarea"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email (cannot be changed)</label>
            <input 
              type="email" 
              id="email"
              value={user?.email || ''} 
              disabled 
              className="form-input disabled"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={uploading}
          >
            {uploading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </section>

      {/* Change Password Section */}
      <section className="profile-section">
        <h2>Change Password</h2>
        <form onSubmit={handleChangePassword} className="profile-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input 
              type="password" 
              id="currentPassword"
              name="currentPassword" 
              value={formData.currentPassword} 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input 
              type="password" 
              id="newPassword"
              name="newPassword" 
              value={formData.newPassword} 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              className="form-input"
            />
          </div>
          
          <button type="submit" className="btn btn-primary">Change Password</button>
        </form>
      </section>

      <button onClick={logout} className="btn btn-danger logout-btn">Logout</button>
    </div>
  );
}

export default ProfilePage;