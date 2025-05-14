
import React from 'react'
import Navbar from '../components/Navbar'
import Calendar from '../components/Calendar'
import { useAuth } from '../components/routeComp/privateRoute'


const Home = () => {

  const userContext = useAuth();

  return (
    <div>
      <Navbar />
      <div className="p-2 bg-cyan-800">
        <h1 className='text-3xl text-white'>Welcome {userContext.currentUser.displayName}</h1>
      </div>
      <Calendar />

    </div>
  )
}

export default Home
