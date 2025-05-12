import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../util/DummyApi';

const Todo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    date: ""
  });
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const todoData = await API.getTodo();
        setTasks(todoData);
      } catch(error) {
        console.error("Error fetching tasks: ", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (editingTask !== null) {
      setEditingTask(prev => ({
        ...prev,
        [id]: value
      }));
    } else {
      setNewTask(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handleAddTask = () => {
    if (newTask.title.trim() === '') return;
    
    const taskToAdd = {
      title: newTask.title,
      dueDate: newTask.date || new Date().toISOString().split('T')[0],
      status: "Not completed",
      // Add any additional fields you might need for Firebase later
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, taskToAdd]);
    setNewTask({ title: "", date: "" });
    closeModal();
  };

  const handleUpdateTask = () => {
    if (!editingTask || editingTask.title.trim() === '') return;
    
    setTasks(prev => prev.map(task => 
      task === editingTask 
        ? { 
            ...editingTask, 
            updatedAt: new Date().toISOString() 
          } 
        : task
    ));
    setEditingTask(null);
    closeModal();
  };

  const toggleTaskStatus = (task) => {
    setTasks(prev => prev.map(t => 
      t === task 
        ? { 
            ...t, 
            status: t.status === "Completed" ? "Not completed" : "Completed",
            updatedAt: new Date().toISOString()
          } 
        : t
    ));
  };

  const deleteTask = (taskToDelete) => {
    setTasks(prev => prev.filter(task => task !== taskToDelete));
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsOpen(true);
  };

  function closeModal() {
    setIsOpen(false);
    setEditingTask(null);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen h-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl text-white font-bold">Todo</h1>
          <button 
            className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded'
            onClick={openModal}
          >
            Create new Task
          </button>
        </div>

        {/* Task Modal - Shared for both add and edit */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
          >
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h2 id="modalTitle" className="text-xl font-bold text-gray-900 sm:text-2xl mb-4">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>

              <div className="space-y-4">
                <div className="task">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={editingTask ? editingTask.title : newTask.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter task description"
                  />
                </div>

                <div className="date">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={editingTask ? editingTask.dueDate : newTask.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
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
                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                >
                  {editingTask ? "Update Task" : "Add Task"}
                </button>
              </footer>
            </div>
          </div>
        )}
        
        {/* Vertical Tasks List */}
        <div className="p-20 rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {tasks.length === 0 ? (
              <li className="p-4 text-center text-gray-500">No tasks yet. Add your first task!</li>
            ) : (
              tasks.map((task, index) => (
                <li key={index} className="hover:bg-gray-50 group">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.status === "Completed"}
                        onChange={() => toggleTaskStatus(task)}
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.status === "Completed" ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {task.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(task)}
                        className="text-gray-500 hover:text-blue-500"
                        aria-label="Edit task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTask(task)}
                        className="text-gray-500 hover:text-red-500"
                        aria-label="Delete task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Todo;