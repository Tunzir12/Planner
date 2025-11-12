import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../assets/logo_color.svg';

const Index = () => {
  return (
    <div className='flex h-screen  bg-gray-800'>
      <div className='flex-col max-w-xl m-auto rounded p-5 '>
        <div className='flex m-10'>
          <img src={logo} className='w-18 h-18 mr-4' alt='Logo' />
          <div className='text-7xl text-gray-200'> GoalGetter </div>
        </div>
        <div className='flex flex-col'>
          <Link className='m-auto my-10 px-10 py-2 rounded bg-gray-100' to='/login'>
            Login
          </Link>
          <Link className='m-auto px-10 py-2 rounded bg-gray-100' to='/register'>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
