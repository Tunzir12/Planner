import { useState } from 'react';
import ToDoComp from '../components/TodoComp';
import Navbar from '../components/Navbar';

const ToDo = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'todo',
    deadline: '',
    priority: 'medium',
  });

  const {
    items,
    history,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    toggleComplete,
    restoreFromHistory,
    clearHistory,
  } = ToDoComp();

  const filteredItems =
    items?.filter(item => {
      if (activeTab === 'all') return true;
      if (activeTab === 'todos') return item.type === 'todo';
      if (activeTab === 'notes') return item.type === 'note';
      return true;
    }) || [];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'todo',
      deadline: '',
      priority: 'medium',
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
      } else {
        await createItem(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEdit = item => {
    setFormData({
      title: item.title,
      description: item.description || '',
      type: item.type,
      deadline: item.deadline || '',
      priority: item.priority || 'medium',
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    return (
      new Date(dateString).toLocaleDateString() +
      ' ' +
      new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const formatRelativeTime = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const isDeadlineApproaching = deadline => {
    if (!deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000;
  };

  const isDeadlinePassed = deadline => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const stats = {
    activeTodos: items?.filter(item => item.type === 'todo' && !item.completed).length || 0,
    completedTodos: history?.length || 0,
    notes: items?.filter(item => item.type === 'note').length || 0,
    overdue:
      items?.filter(
        item => item.type === 'todo' && !item.completed && isDeadlinePassed(item.deadline),
      ).length || 0,
  };

  if (loading && (!items || items.length === 0)) {
    return (
      <>
        <Navbar />
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading your todos and notes...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-6xl mx-auto px-4'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Todos & Notes</h1>
            <p className='text-gray-600'>Organize your tasks and thoughts</p>
          </div>

          {/* Stats Dashboard */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
            <div className='bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500'>
              <div className='text-2xl font-bold text-gray-900'>{stats.activeTodos}</div>
              <div className='text-sm text-gray-600'>Active Todos</div>
            </div>
            <div className='bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500'>
              <div className='text-2xl font-bold text-gray-900'>{stats.completedTodos}</div>
              <div className='text-sm text-gray-600'>Completed</div>
            </div>
            <div className='bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500'>
              <div className='text-2xl font-bold text-gray-900'>{stats.notes}</div>
              <div className='text-sm text-gray-600'>Notes</div>
            </div>
            <div className='bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500'>
              <div className='text-2xl font-bold text-gray-900'>{stats.overdue}</div>
              <div className='text-sm text-gray-600'>Overdue</div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
              {error}
            </div>
          )}

          {/* Tabs and Add Button */}
          <div className='flex justify-between items-center mb-6'>
            <div className='flex space-x-1 bg-white rounded-lg p-1 shadow-sm'>
              {['all', 'todos', 'notes', 'history'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                  {tab === 'history'
                    ? ` (${history?.length || 0})`
                    : tab !== 'all'
                      ? ` (${items?.filter(item => item.type === tab.slice(0, -1)).length || 0})`
                      : ` (${items?.length || 0})`}
                </button>
              ))}
            </div>

            {activeTab !== 'history' && (
              <button
                onClick={() => setShowForm(true)}
                className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                <span>Add New</span>
              </button>
            )}
          </div>

          {/* Create/Edit Form */}
          {showForm && activeTab !== 'history' && (
            <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
              <h3 className='text-lg font-semibold mb-4'>
                {editingItem ? 'Edit Item' : 'Create New Item'}
              </h3>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Title *</label>
                  <input
                    type='text'
                    name='title'
                    value={formData.title}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Enter title'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Description
                  </label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    rows='3'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Enter description (optional)'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Type</label>
                    <select
                      name='type'
                      value={formData.type}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='todo'>Todo</option>
                      <option value='note'>Note</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Priority</label>
                    <select
                      name='priority'
                      value={formData.priority}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='high'>High</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Deadline</label>
                    <input
                      type='datetime-local'
                      name='deadline'
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                <div className='flex justify-end space-x-3 pt-4'>
                  <button
                    type='button'
                    onClick={resetForm}
                    className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* History Tab Content */}
          {activeTab === 'history' ? (
            <div className='space-y-4'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Completed Todos ({history?.length || 0})
                </h2>
                {history && history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className='text-red-500 hover:text-red-700 text-sm flex items-center space-x-1 transition-colors'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                    <span>Clear All History</span>
                  </button>
                )}
              </div>

              {!history || history.length === 0 ? (
                <div className='text-center py-12 bg-white rounded-lg shadow'>
                  <svg
                    className='w-16 h-16 mx-auto text-gray-400 mb-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>No completed todos yet</h3>
                  <p className='text-gray-500'>Complete some todos to see them here</p>
                </div>
              ) : (
                history.map(item => (
                  <div
                    key={item.id}
                    className='bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex items-center space-x-3 flex-1'>
                        <div className='w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white'>
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                        </div>

                        <div className='flex-1'>
                          <h3 className='text-lg font-semibold text-gray-900 line-through'>
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className='text-gray-600 mt-1 line-through'>{item.description}</p>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => restoreFromHistory(item.id)}
                          className='text-blue-500 hover:text-blue-700 transition-colors'
                          title='Restore todo'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className='text-red-500 hover:text-red-700 transition-colors'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className='flex justify-between items-center text-sm text-gray-500'>
                      <div className='flex items-center space-x-4'>
                        <span className='px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'>
                          Completed
                        </span>

                        {item.priority && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : item.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {item.priority} priority
                          </span>
                        )}

                        {item.completedAt && (
                          <span>Completed: {formatRelativeTime(item.completedAt)}</span>
                        )}
                      </div>

                      {item.deadline && (
                        <div className='text-right text-gray-600'>
                          Was due: {formatDate(item.deadline)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Active Items List */
            <div className='space-y-4'>
              {!filteredItems || filteredItems.length === 0 ? (
                <div className='text-center py-12 bg-white rounded-lg shadow'>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>No items yet</h3>
                  <p className='text-gray-500'>Create your first item to get started</p>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                      item.type === 'note'
                        ? 'border-purple-500'
                        : item.completed
                          ? 'border-green-500'
                          : isDeadlinePassed(item.deadline)
                            ? 'border-red-500'
                            : isDeadlineApproaching(item.deadline)
                              ? 'border-orange-500'
                              : 'border-blue-500'
                    }`}
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex items-center space-x-3 flex-1'>
                        {item.type === 'todo' && (
                          <button
                            onClick={() => toggleComplete(item.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              item.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {item.completed && (
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M5 13l4 4L19 7'
                                />
                              </svg>
                            )}
                          </button>
                        )}

                        <div className='flex-1'>
                          <h3
                            className={`text-lg font-semibold text-gray-900 ${
                              item.completed ? 'line-through' : ''
                            }`}
                          >
                            {item.title}
                          </h3>
                          {item.description && (
                            <p
                              className={`text-gray-600 mt-1 ${
                                item.completed ? 'line-through' : ''
                              }`}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => startEdit(item)}
                          className='text-blue-500 hover:text-blue-700 transition-colors'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className='text-red-500 hover:text-red-700 transition-colors'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className='flex justify-between items-center text-sm text-gray-500'>
                      <div className='flex items-center space-x-4'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.type === 'note'
                              ? 'bg-purple-100 text-purple-800'
                              : item.completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.type === 'note' ? 'Note' : item.completed ? 'Completed' : 'Todo'}
                        </span>

                        {item.priority && item.type === 'todo' && !item.completed && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : item.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {item.priority} priority
                          </span>
                        )}

                        {item.createdAt && (
                          <span>Created: {formatRelativeTime(item.createdAt)}</span>
                        )}
                      </div>

                      {item.deadline && item.type === 'todo' && !item.completed && (
                        <div
                          className={`text-right ${
                            isDeadlinePassed(item.deadline)
                              ? 'text-red-600 font-semibold'
                              : isDeadlineApproaching(item.deadline)
                                ? 'text-orange-600'
                                : 'text-gray-600'
                          }`}
                        >
                          Due: {formatDate(item.deadline)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ToDo;
