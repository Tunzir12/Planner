import { React, useEffect, useState } from 'react';

import { getDocs, collection, query, where } from 'firebase/firestore';

import { db } from '../firebase';

async function getUsers() {
  const querySnapshot = await getDocs(collection(db, 'users'));

  var users = querySnapshot.docs.map(doc => doc.data());

  return users;
}

const UserList = () => {
  const [users, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUser)
      .then(() => setLoading(false));
  }, []);

  if (loading) return <div> no</div>;
  else
    return (
      <div>
        {' '}
        users{' '}
        {users.map(user => (
          <div>{user.DisplayName}</div>
        ))}{' '}
      </div>
    );
};

const Test = () => {
  return <UserList></UserList>;
};

export default Test;
