import React from 'react'

const Table = ({ headers, data }) => {

  return (
    <table className="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400 ">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          {headers.map((header, index) => (
            <th key={index} scope="col" className="px-6 py-3">
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map(
          (list, index) => (
            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
              {list.map((element, elementIndex) => (
                <td key={elementIndex} className="px-6 py-4">
                  {element}
                </td>))}
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}

export default Table;
