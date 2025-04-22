import React from 'react'

const DetailsList = ({ headers, data }) => (
  <div class="flow-root my-6">
    <dl class="-my-3 divide-y divide-gray-200 text-sm dark:divide-gray-700">
      {headers.map((header, index) => (
        <div class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt class="font-medium text-gray-900 dark:text-white">{header}</dt>
          <dd class="text-gray-700 sm:col-span-2 dark:text-gray-200">{data[index]}</dd>
        </div>
      ))}
    </dl>
  </div>
)


export default DetailsList;
