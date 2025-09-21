import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { auth } from '../firebase'

const Profile = () => {

  const [user] = useState(auth);

  return (
    <div>
      <Navbar />

      <div className="flex flex-1">

      </div>

    </div>
  )
}

export default Profile