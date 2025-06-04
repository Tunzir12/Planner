import React, { useState } from 'react'

const PopupForm = ({ title, children, handleFormData }) => {

  const [isOpen, setIsOpen] = useState(false);

  const handleFormAction = (formData) => {
    handleFormData(formData)
    setIsOpen(false)
  }

  return (
    <div>
      <button className="btn btn-blue" onClick={() => setIsOpen(true)}>
        {title}
      </button>

      {
        isOpen && (
          <div
            className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
          >
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <h2 id="modalTitle" className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                  {title}
                </h2>

                <button
                  type="button"
                  className="-me-4 -mt-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label="Close"
                >
                </button>
              </div>

              <form className="mt-4" action={handleFormAction} >

                <div className="text-gray-700 dark:text-gray-200">
                  {children}
                </div>

                <footer className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Done
                  </button>
                </footer>
              </form>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default PopupForm;
