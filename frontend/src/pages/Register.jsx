import {React, useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';



import logo from '../assets/logo_color.svg'

const Register = () => {

  const goto = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;

        return updateProfile(user, {
          displayName: displayName
        });
      });
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
          <label className="block mb-2" >Name</label>
          <input className="w-full p-2 mb-6 border-b-2 outline-none" type="text" name="displayName" id="displayName" placeholder='Enter Full Name' value={displayName} onChange={(e) => setDisplayName(e.target.value)} /><br />

          <label className="block mb-2" >Email</label>
          <input className="w-full p-2 mb-6 border-b-2 outline-none" type="email" name="email" id="email" placeholder='Enter Email' value={email} onChange={(e) => setEmail(e.target.value)} /><br />

          <label className="block mb-2" >Password</label>
          <input className="w-full p-2 mb-6 border-b-2 outline-none" type="password" name="password" id="password" placeholder='Enter Password' value={password} onChange={(e) => setPassword(e.target.value)}/><br />

          <button className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 mb-6 rounded"
           type="submit" >
            Register
          </button>

          <Link className="text-sm float-left hover:text-gray-700" to='/' >Back to login</Link>
        </form>
      </div>
    </div>
  )
}

export default Register
