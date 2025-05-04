
import React from 'react'
import Navbar from '../components/Navbar'
import Calendar from '../components/Calendar'
import { auth, signOut } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/routeComp/privateRoute'


const Home = () => {

  const userContext = useAuth();

  const goto = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out!');
      goto('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-2 bg-blue-600">
        <button type='submit' onClick={handleSignOut}>
          Log out
        </button>
        <h1>Welcome {userContext.currentUser.email}</h1>
      </div>

      <Calendar />

    </div>
  )
}

export default Home
