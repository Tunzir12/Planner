import { Navigate, Outlet } from 'react-router-dom';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../../../backend/firebase';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async uid => {
      const db = getFirestore();
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        setUserData({ displayName: auth.currentUser?.displayName || auth.currentUser?.email });
      }
    };

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
          setCurrentUser(user);
          if (user) {
            await fetchUserData(user.uid);
          } else {
            setUserData(null);
          }
          setLoading(false);
        });
        return unsubscribe;
      })
      .catch(error => {
        console.error('Auth persistence error:', error);
        setLoading(false);
      });
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
