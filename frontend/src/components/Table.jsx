import React from 'react'

const Table = ({ headers, data, dataToRow }) => {

  return (
    <table class="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 ">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          {headers.map((header) => (
            <th scope="col" class="px-6 py-3">
              {header}
            </th>
          ))}
        </tr>
      </thead>

      {data.map(
        (list) => (
          <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
            {list.map((element) => (
              <td class="px-6 py-4">
                {element}
              </td>))}
          </tr>
        ))
      }
    </table>
  )
}

export default Table;
