import React from 'react';

const Divider = ({ title }) => (
  <span className='flex items-center my-3'>
    <span className='shrink-0 pe-4 text-gray-900 dark:text-white'>{title}</span>
    <span className='h-px flex-1 bg-gray-300 dark:bg-gray-600'></span>
  </span>
);

export default Divider;
