import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from '@fullcalendar/timegrid';
import { useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useEvents } from '../useEvents';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const Calendar = () => {
  const [user] = useAuthState(auth);
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useEvents();
  const [isOpen, setIsOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    title: '',
    description: '',
    start: null,
    end: null,
    allDay: false,
    backgroundColor: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [operationError, setOperationError] = useState(null);

  const calendarRef = useRef(null);

 // Format time for input[type="time"] - using local time
const formatTimeForInput = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  
  // Use local hours and minutes
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

// Format date for input[type="date"] - using local date
const formatDateForInput = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  
  // Use local date components
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};


// Set time to start of day (00:00:00) in local time
const setToStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Set time to end of day (23:59:59) in local time
const setToEndOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

  // Modal functions
  const closeModal = () => {
    setIsOpen(false);
    setIsEditMode(false);
    setCurrentEventId(null);
    setOperationError(null);
    setCurrentEvent({
      title: '',
      description: '',
      start: null,
      end: null,
      allDay: false,
      backgroundColor: ''
    });
  };

  const openModal = () => setIsOpen(true);

const handleDateClick = (arg) => {
  // arg.date is already a Date object representing the clicked day
  // We need to ensure it's treated as a local date, not UTC
  
  const clickedDate = new Date(arg.date);
  const startDate = setToStartOfDay(clickedDate);
  const endDate = setToEndOfDay(clickedDate);
  
  setCurrentEvent({
    title: '',
    description: '',
    start: startDate,
    end: endDate,
    allDay: true, // Default to all-day for date clicks
    backgroundColor: "#3b82f6" // Blue for all-day events
  });
  
  openModal();
};

  const handleSelect = (selectInfo) => {
    const isAllDay = selectInfo.allDay;
    
    setCurrentEvent({
      title: '',
      description: '',
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: isAllDay,
      backgroundColor: isAllDay ? "#3b82f6" : "#60a5fa" // Different colors for all-day vs timed events
    });
    openModal();
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    
    // For all-day events, ensure we have proper start/end times
    let start = event.start;
    let end = event.end;
    
    if (event.allDay) {
      // If it's an all-day event without proper end date, set to end of start day
      if (!end) {
        end = setToEndOfDay(start);
      }
    } else if (!end) {
      // For timed events without end, add 1 hour
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }
    
    setCurrentEvent({
      title: event.title,
      description: event.extendedProps.description || '',
      start: start,
      end: end,
      allDay: event.allDay,
      backgroundColor: event.backgroundColor
    });
    
    // Find the Firestore ID from the events array
    const firestoreEvent = events.find(e => 
      e.title === event.title && 
      e.start.getTime() === event.start.getTime()
    );
    
    setCurrentEventId(firestoreEvent?.id || null);
    setIsEditMode(true);
    openModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleTimeChange = (e) => {
  const { name, value } = e.target;
  
  setCurrentEvent(prev => {
    if (!prev[name]) return prev;
    
    // Create a new date with the updated time but same date
    const currentDate = new Date(prev[name]);
    const [hours, minutes] = value.split(':').map(Number);
    
    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes);
    
    return {
      ...prev,
      [name]: newDate
    };
  });
};

const handleDateChange = (e) => {
  const { name, value } = e.target;
  
  setCurrentEvent(prev => {
    if (!prev[name]) return prev;
    
    // Get the current date to preserve time portion
    const currentDate = new Date(prev[name]);
    const [year, month, day] = value.split('-').map(Number);
    
    // Create new date with the same time but new date
    const newDate = new Date(
      year, 
      month - 1, 
      day,
      currentDate.getHours(),
      currentDate.getMinutes()
    );
    
    return {
      ...prev,
      [name]: newDate
    };
  });
};

const handleAllDayChange = (e) => {
  const isAllDay = e.target.checked;
  
  setCurrentEvent(prev => {
    let newStart = prev.start ? new Date(prev.start) : new Date();
    let newEnd = prev.end ? new Date(prev.end) : new Date();
    
    if (isAllDay) {
      // Convert to all-day: use only the date portion
      // If it was a multi-day event, preserve the date range but adjust times
      const startDate = setToStartOfDay(newStart);
      const endDate = setToStartOfDay(newEnd);
      
      // If it's a single day event or same start/end date
      if (startDate.getTime() === endDate.getTime()) {
        newStart = startDate;
        newEnd = setToEndOfDay(startDate);
      } else {
        // For multi-day events, preserve the date range but adjust times
        newStart = startDate;
        newEnd = setToEndOfDay(endDate);
      }
    } else {
      // Convert from all-day to timed event
      if (prev.allDay) {
        // If it was all-day, set reasonable default times (9 AM to 5 PM)
        const startOfDay = setToStartOfDay(newStart);
        startOfDay.setHours(9, 0, 0, 0); // 9:00 AM
        
        const endOfDay = setToStartOfDay(newEnd);
        // If it's a single day event, end at 5 PM
        if (newStart.getDate() === newEnd.getDate() && 
            newStart.getMonth() === newEnd.getMonth() && 
            newStart.getFullYear() === newEnd.getFullYear()) {
          endOfDay.setHours(17, 0, 0, 0); // 5:00 PM
        } else {
          // For multi-day events, end at 11:59 PM of the last day
          endOfDay.setHours(23, 59, 59, 999);
        }
        
        newStart = startOfDay;
        newEnd = endOfDay;
      }
    }
    
    return {
      ...prev,
      start: newStart,
      end: newEnd,
      allDay: isAllDay,
      backgroundColor: isAllDay ? "#3b82f6" : "#60a5fa"
    };
  });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOperationError(null);
    
    try {
      // Validate required fields
      if (!currentEvent.title || !currentEvent.start || !currentEvent.end) {
        setOperationError('Title, start time, and end time are required');
        return;
      }

      // Validate that start is before end
      if (currentEvent.allDay == "false" && currentEvent.start >= currentEvent.end) {
        setOperationError('End time must be after start time');
        return;
      }

      // For all-day events, ensure they span full days
      let startDate = new Date(currentEvent.start);
      let endDate = new Date(currentEvent.end);
      
      if (currentEvent.allDay) {
        startDate = setToStartOfDay(startDate);
        endDate = setToEndOfDay(endDate);
        
        // For multi-day all-day events, ensure end is at end of the last day
        if (endDate <= startDate) {
          endDate = setToEndOfDay(startDate);
        }
      }

      const eventData = {
        title: currentEvent.title,
        description: currentEvent.description || '',
        start: startDate,
        end: endDate,
        allDay: Boolean(currentEvent.allDay),
        backgroundColor: currentEvent.backgroundColor || (currentEvent.allDay ? "#3b82f6" : "#60a5fa"),
        
      };

      if (isEditMode && currentEventId) {
        await updateEvent(currentEventId, eventData);
      } else {
        await createEvent(eventData);
      }
      
      closeModal();
    } catch (error) {
      console.error("Error saving event: ", error);
      setOperationError(error.message || 'Failed to save event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!currentEventId) return;
    
    try {
      await deleteEvent(currentEventId);
      closeModal();
    } catch (error) {
      console.error("Error deleting event: ", error);
      setOperationError(error.message || 'Failed to delete event');
    }
  };

  // Render function for calendar events
  const renderEventContent = (eventInfo) => {
    return (
      <div className={`p-1 w-full rounded-lg ${eventInfo.event.allDay ? 'bg-blue-600' : 'bg-blue-500'}`}>
        <b>{eventInfo.event.title}</b>
        {eventInfo.event.extendedProps.description && (
          <p className="text-xs">{eventInfo.event.extendedProps.description}</p>
        )}
        {!eventInfo.event.allDay && (
          <p className="text-xs">{eventInfo.timeText}</p>
        )}
      </div>
    );
  };

  return (
    <div className='flex flex-col h-screen max-w-screen dark:bg-gray-900'>
      {/* Loading and error states */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md">Loading...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError('')}>
            ×
          </button>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden text-white">
        <div className="h-full p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            headerToolbar={{
              start: 'prev,next today',
              center: 'dayGridMonth,timeGridWeek,timeGridDay',
              end: 'title'
            }}
            initialView='dayGridMonth'
            weekends={true}
            events={events}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
            eventContent={renderEventContent}
            editable={true}
            selectable={true}
            dateClick={handleDateClick}
            select={handleSelect}
            eventClick={handleEventClick}
            selectOverlap={true}
            height="100%"
            contentHeight="auto"
            aspectRatio={1.35}
            dayMaxEventRows={3}
            views={{
              dayGridMonth: {
                dayMaxEventRows: 3
              },
              timeGridWeek: {
                dayHeaderFormat: { weekday: 'short', day: 'numeric' }
              },
            }}
          />
        </div>
      </div>

      {/* Event Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {isEditMode ? 'Edit Event' : 'Add New Event'}
                  </Dialog.Title>
                  
                  {operationError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 text-sm">
                      {operationError}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Event Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={currentEvent.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Event Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows="3"
                        value={currentEvent.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {!currentEvent.allDay && (
                      <>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                              Start Date *
                            </label>
                            <input
                              type="date"
                              name="start"
                              id="start-date"
                              required
                              value={currentEvent.start ? formatDateForInput(currentEvent.start) : ''}
                              onChange={handleDateChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">
                              Start Time *
                            </label>
                            <input
                              type="time"
                              name="start"
                              id="start-time"
                              required
                              value={currentEvent.start ? formatTimeForInput(currentEvent.start) : ''}
                              onChange={handleTimeChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                              End Date *
                            </label>
                            <input
                              type="date"
                              name="end"
                              id="end-date"
                              required
                              value={currentEvent.end ? formatDateForInput(currentEvent.end) : ''}
                              onChange={handleDateChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">
                              End Time *
                            </label>
                            <input
                              type="time"
                              name="end"
                              id="end-time"
                              required
                              value={currentEvent.end ? formatTimeForInput(currentEvent.end) : ''}
                              onChange={handleTimeChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {currentEvent.allDay && (
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor="allDay-date" className="block text-sm font-medium text-gray-700">
                            Date *
                          </label>
                          <input
                            type="date"
                            name="start"
                            id="allDay-date"
                            required
                            value={currentEvent.start ? formatDateForInput(currentEvent.start) : ''}
                            onChange={handleDateChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="allDay"
                        id="allDay"
                        checked={currentEvent.allDay}
                        onChange={handleAllDayChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700">
                        All-day event
                      </label>
                    </div>

                    <div className="mt-4 flex justify-between">
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={handleDeleteEvent}
                          className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                          Delete
                        </button>
                      )}
                      <div className="flex justify-end space-x-3 ml-auto">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                          {isEditMode ? 'Update' : 'Add'} Event
                        </button>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Calendar;