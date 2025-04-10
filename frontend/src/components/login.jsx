import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from './navbar'

const Login = () => {
  return (
    <div>
      <div className="form">
        <Navbar />

        <label htmlFor="">email</label>
        <input type="email" placeholder='Email' /><br />

        <label htmlFor="">Password</label>
        <input type="pass" name="" id="" placeholder='Password' /><br />

        <Link >Log in</Link>
      </div>
    </div>
  )
}

export default Login
