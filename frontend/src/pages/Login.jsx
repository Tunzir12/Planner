import {React, useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, signInWithEmailAndPassword } from '../firebase';

import logo from '../assets/logo_color.svg'



const Login = () => {

  const goto = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed up!');
      goto('/home');
    } catch (error) {
      console.error('Error signing up:', error.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <div className="w-full max-w-xs m-auto rounded p-5 bg-gray-100 shadow-xl">
        <header>
          <img src={logo} className="w-20 mx-auto mb-5" alt="Logo" />
        </header>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2" >Email</label>
          <input className="w-full p-2 mb-6 border-b-2 outline-none " type="email" name="email" id="email" placeholder='Enter Email' value={email} onChange={(e) => setEmail(e.target.value)} /><br />

          <label className="block mb-2" >Password</label>
          <input className="w-full p-2 mb-6 border-b-2 outline-none" type="password" name="password" id="password" placeholder='Enter Password' value={password} onChange={(e) => setPassword(e.target.value)}/><br />

          <button className="w-full bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 mb-6 rounded" type="submit"  >
            Log In </button>

          <Link className="text-sm float-left hover:text-gray-700" to='/home' >Forgot Password?</Link>
          <Link className="text-sm float-right hover:text-gray-700" to='/register' >Create account</Link>
        </form>
      </div>
    </div>
  )
}

export default Login
