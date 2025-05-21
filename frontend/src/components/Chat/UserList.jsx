import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import PropTypes from 'prop-types';

const UserList = ({ currentUser, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        // Query all users except current user
        const q = query(usersRef, where('__name__', '!=', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser.uid]);

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="user-list">
      <h3>Select a user to chat with:</h3>
      <ul>
        {users.map(user => (
          <li key={user.id} onClick={() => onSelectUser(user)}>
            <span>{user.DisplayName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

UserList.propTypes = {
  currentUser: PropTypes.shape({
    uid: PropTypes.string.isRequired,
  }).isRequired,
  onSelectUser: PropTypes.func.isRequired,
};

export default UserList;  // Make sure to export the component