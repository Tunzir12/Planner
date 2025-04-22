import React from 'react'

const Divider = ({ title }) => (
  <span class="flex items-center my-3">
    <span class="shrink-0 pe-4 text-gray-900 dark:text-white">{title}</span>
    <span class="h-px flex-1 bg-gray-300 dark:bg-gray-600"></span>
  </span>
)


export default Divider;
