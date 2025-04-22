import React, { useRef } from 'react'
import Navbar from '../components/Navbar'

const Todo = () => {

  const newTaskRef = useRef(null)

  function closeModal() {
    setIsOpen(false)
}

function openModal() {
    setIsOpen(true)
}

  const handleNewTask = () => {
    openModal()
  }
  
  return (
    <div>
      <Navbar />
      <h1>Todo</h1>

      <div className='justify-between p-32'>
        <div className="upcoming">
          <button onClick={handleNewTask}>Create new Task</button>
        </div>

      </div>
    </div>
  )
}

export default Todo
