import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className='box'>
        <div className="form">
            <label htmlFor="">Name:</label>
            <input type="text" placeholder='Enter Full Name' /><br/>

            <label htmlFor="">Email:</label>
            <input type="email" name="" id="" placeholder='Enter Email'/><br />

            <label htmlFor="">Password:</label>
            <input type="pass" name="" id="" placeholder='enter Password' /><br />

            <button>Register</button><br />

            <Link to='/login' >Login</Link>
        </div>
    </div>
  )
}

export default Home