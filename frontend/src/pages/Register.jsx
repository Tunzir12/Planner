import React from 'react'
import { Link } from 'react-router-dom'

import logo from '../assets/logo_color.svg'

const Register = () => {
  return (
    <div class="flex h-screen bg-blue-900">
      <div class="w-full max-w-xs m-auto rounded p-5 bg-blue-100 shadow-xl">
        <header>
          <img src={logo} class="w-20 mx-auto mb-5" alt="Logo" />
        </header>
        <form>
          <label class="block mb-2" for="username">Name</label>
          <input class="w-full p-2 mb-6 border-b-2 outline-none" type="text" placeholder='Enter Full Name' /><br />

          <label class="block mb-2" for="email">Email</label>
          <input class="w-full p-2 mb-6 border-b-2 outline-none" type="email" name="" id="" placeholder='Enter Email' /><br />

          <label class="block mb-2" for="password">Password</label>
          <input class="w-full p-2 mb-6 border-b-2 outline-none" type="pass" name="" id="" placeholder='Enter Password' /><br />

          <input class="w-full bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 mb-6 rounded" type="submit" value="Register" />

          <Link class="text-sm float-left hover:text-green-700" to='/' >Back to login</Link>
        </form>
      </div>
    </div>
  )
}

export default Register
