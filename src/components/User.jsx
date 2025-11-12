import React from 'react';

const User = ({ user, users }) => {
  // Handle single user object
  if (user && !users) {
    return (
      <div className='inline-flex items-center'>
        <span className='mr-2'>{user.displayName || user.email || 'Unknown User'}</span>
      </div>
    );
  }

  // Handle array of users
  if (users && Array.isArray(users)) {
    return (
      <div className='flex flex-wrap gap-1'>
        {users.map((userObj, index) => (
          <span
            key={userObj.uid || userObj.id || index}
            className='inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200'
          >
            {userObj.displayName || userObj.email || 'Unknown User'}
            {index < users.length - 1 && ','}
          </span>
        ))}
      </div>
    );
  }

  return <div>No users</div>;
};

export default User;
