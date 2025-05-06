import React, { useState } from 'react'
import Navbar from '../components/Navbar'



const Todo = () => {

  const [isOpen, setIsOpen] = useState(false)

  function closeModal(){
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <div>
      <Navbar />
      <h1>Todo</h1>
      <div className="justify-between ">
        <button className='bg-blue-400'
        onClick={openModal}>

          Create new Tasks
        </button>

          {/* Event Modal */}
          { isOpen && (
          <div
            className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
          >
            <div className="w-full max-w-md rounded-lg bg-white p-10 shadow-lg">
              <h2 id="modalTitle" className="text-xl font-bold text-gray-900 sm:text-2xl">Add task</h2>

              <div className="gap-2">
                <div className="task">
                <label htmlFor="task" className="relative">
                  <input
                    type="title"
                    id="taskTitle"
                    placeholder=""
                    className="peer mt-0.5 w-full p-2.5 rounded border-gray-300 shadow-sm sm:text-sm"
                  />

                  <span
                    className="absolute inset-y-0 start-3 -translate-y-5 bg-white px-0.5 text-sm font-medium text-gray-700 transition-transform peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-5"
                  >
                    Task
                  </span>
                </label>
                </div>

                <div className="date">
                <label htmlFor="date" className="relative">
              <input
                type="date"
                id="date"
                placeholder=""
                className="peer mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm"
              />

              <span
                className="absolute inset-y-0 start-3 -translate-y-5 bg-white px-0.5 text-sm font-medium text-gray-700 transition-transform peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-5"
              >
               
              </span>
            </label>
                </div>


            </div>

              <div className="mt-4">
                <p className="text-pretty text-gray-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, nisi eu
                  consectetur. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              <footer className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  onClick={closeModal}
                >
                  Done
                </button>
              </footer>
            </div>
          </div>
          )}
        
      </div>

      <div className='justify-between p-32'>
        <div className="upcoming">
        <fieldset>
          <legend className="sr-only">Checkboxes</legend>

          <div className="flow-root">
            <div className="-my-3 flex flex-col items-start divide-y divide-gray-200">
              <label htmlFor="Option1" className="inline-flex items-start gap-3 py-3">
                <input
                  type="checkbox"
                  className="my-0.5 size-5 rounded border-gray-300 shadow-sm"
                  id="Option1"
                />

                <div>
                  <span className="font-medium text-gray-700"> Option 1 </span>

                  <p className="mt-0.5 text-sm text-gray-700">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ea, distinctio.
                  </p>
                </div>
              </label>

              <label htmlFor="Option2" className="inline-flex items-start gap-3 py-3">
                <input
                  type="checkbox"
                  className="my-0.5 size-5 rounded border-gray-300 shadow-sm"
                  id="Option2"
                />

                <div>
                  <span className="font-medium text-gray-700"> Option 2 </span>

                  <p className="mt-0.5 text-sm text-gray-700">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ea, distinctio.
                  </p>
                </div>
              </label>

              <label htmlFor="Option3" className="inline-flex items-start gap-3 py-3">
                <input
                  type="checkbox"
                  className="my-0.5 size-5 rounded border-gray-300 shadow-sm"
                  id="Option3"
                />

                <div>
                  <span className="font-medium text-gray-700"> Option 3 </span>

                  <p className="mt-0.5 text-sm text-gray-700">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ea, distinctio.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </fieldset>
          
        </div>

      </div>
    </div>
  )
}

export default Todo



