import { React, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { firebaseRest } from '../firebaseRest';
import Navbar from '../components/Navbar';
import {
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
} from 'firebase/auth';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [userData, setUserData] = useState({
    name: '',
    displayName: '',
    email: '',
    emailVerified: false,
  });

  const [profileUpdates, setProfileUpdates] = useState({
    displayName: '',
  });

  const [passwordUpdate, setPasswordUpdate] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (user) {
        const userDoc = await firebaseRest.get('users', user.uid);

        setUserData({
          name: userDoc.name || '',
          displayName: userDoc.displayName || '',
          email: userDoc.email || '',
          emailVerified: user.emailVerified || false,
        });

        setProfileUpdates({
          displayName: userDoc.displayName || '',
        });

        setPasswordUpdate({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');

      setUserData({
        name: '',
        displayName: '',
        email: '',
        emailVerified: false,
      });

      setProfileUpdates({
        displayName: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const updates = {};

      if (profileUpdates.displayName !== userData.displayName) {
        await updateProfile(user, {
          displayName: profileUpdates.displayName,
        });
        updates.displayName = profileUpdates.displayName;
      }

      if (Object.keys(updates).length > 0) {
        const currentUserData = await firebaseRest.get('users', user.uid);
        await firebaseRest.update('users', user.uid, {
          ...currentUserData,
          ...updates,
          updatedAt: new Date(),
        });
      }

      setSuccess(`Profile updated successfully!`);
      await fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      if (passwordUpdate.newPassword !== passwordUpdate.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (!passwordUpdate.currentPassword) {
        throw new Error('Current password is required');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, passwordUpdate.currentPassword);

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordUpdate.newPassword);

      setSuccess('Password updated successfully!');
      setPasswordUpdate({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      const user = auth.currentUser;
      await sendEmailVerification(user);
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (error) {
      setError('Failed to send verification email');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>Profile Settings</h1>
            <p className='text-gray-600'>Manage your account information and preferences</p>
          </div>

          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Sidebar Navigation */}
            <div className='lg:w-1/4'>
              <div className='bg-white rounded-xl shadow-sm p-6 sticky top-8'>
                <nav className='space-y-2'>
                  <button
                    onClick={() => setActiveSection('profile')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === 'profile'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                      <span className='font-medium'>Profile Information</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveSection('password')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === 'password'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                      <span className='font-medium'>Change Password</span>
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className='lg:w-3/4'>
              {/* Messages */}
              {error && (
                <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                  {error}
                </div>
              )}
              {success && (
                <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  {success}
                </div>
              )}

              {/* Profile Information Section */}
              {activeSection === 'profile' && (
                <div className='bg-white rounded-xl shadow-sm p-6'>
                  <div className='flex items-center mb-6'>
                    <div className='w-3 h-6 bg-blue-600 rounded-r-lg mr-3'></div>
                    <h2 className='text-xl font-semibold text-gray-800'>Profile Information</h2>
                  </div>

                  {/* Current Info Card */}
                  <div className='bg-gray-50 rounded-lg p-6 mb-6'>
                    <h3 className='font-medium text-gray-700 mb-4'>Current Information</h3>
                    <div className='grid md:grid-cols-2 gap-4'>
                      <div>
                        <label className='text-sm text-gray-500'>Full Name</label>
                        <p className='font-medium text-gray-800'>
                          {userData.displayName || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <label className='text-sm text-gray-500'>Email</label>
                        <p className='font-medium text-gray-800'>{userData.email}</p>
                      </div>
                      <div>
                        <label className='text-sm text-gray-500'>Email Verification</label>
                        <div className='flex items-center space-x-2'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userData.emailVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {userData.emailVerified ? 'Verified' : 'Not Verified'}
                          </span>
                          {!userData.emailVerified && (
                            <button
                              onClick={sendVerificationEmail}
                              className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                            >
                              Verify Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Update Form */}
                  <form onSubmit={handleProfileUpdate}>
                    <h3 className='font-medium text-gray-700 mb-4'>Update Profile</h3>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Display Name
                        </label>
                        <input
                          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                          type='text'
                          value={profileUpdates.displayName || ''}
                          onChange={e =>
                            setProfileUpdates(prev => ({ ...prev, displayName: e.target.value }))
                          }
                          placeholder='Enter your display name'
                        />
                      </div>

                      <button
                        type='submit'
                        disabled={saving}
                        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {saving ? (
                          <div className='flex items-center justify-center'>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                            Updating...
                          </div>
                        ) : (
                          'Update Profile'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Change Section */}
              {activeSection === 'password' && (
                <div className='bg-white rounded-xl shadow-sm p-6'>
                  <div className='flex items-center mb-6'>
                    <div className='w-3 h-6 bg-blue-600 rounded-r-lg mr-3'></div>
                    <h2 className='text-xl font-semibold text-gray-800'>Change Password</h2>
                  </div>

                  <form onSubmit={handlePasswordUpdate}>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Current Password
                        </label>
                        <input
                          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                          type='password'
                          value={passwordUpdate.currentPassword || ''}
                          onChange={e =>
                            setPasswordUpdate(prev => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          placeholder='Enter current password'
                          required
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          New Password
                        </label>
                        <input
                          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                          type='password'
                          value={passwordUpdate.newPassword || ''}
                          onChange={e =>
                            setPasswordUpdate(prev => ({ ...prev, newPassword: e.target.value }))
                          }
                          placeholder='Enter new password'
                          required
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Confirm New Password
                        </label>
                        <input
                          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                          type='password'
                          value={passwordUpdate.confirmPassword || ''}
                          onChange={e =>
                            setPasswordUpdate(prev => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          placeholder='Confirm new password'
                          required
                        />
                      </div>

                      <button
                        type='submit'
                        disabled={saving}
                        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {saving ? (
                          <div className='flex items-center justify-center'>
                            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                            Updating Password...
                          </div>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
