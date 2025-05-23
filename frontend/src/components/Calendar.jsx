import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction"
import timeGridPlugin from '@fullcalendar/timegrid'
import { useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db,auth } from '../firebase' 
import { useAuthState } from 'react-firebase-hooks/auth'

const Calendar = () => {
    const [user] = useAuthState(auth)
    const [isOpen, setIsOpen] = useState(false)
    const [currentEvent, setCurrentEvent] = useState({
        title: '',
        description: '',
        start: '',
        end: '',
        allDay: false,
        backgroundColor: ''
    })
    const [events, setEvents] = useState([])
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentEventId, setCurrentEventId] = useState(null)

    const calendarRef = useRef(null)

    // Fetch events from Firestore
    useEffect(() => {
        const fetchEvents = async () => {
            if (!user) return
            try {
                const q = query(
                    collection(db, 'events'),
                    where('userId', '==', user.uid)
                )
                const querySnapshot = await getDocs(q)
                const eventsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    start: doc.data().start.toDate(),
                    end: doc.data().end.toDate()
                }))
                setEvents(eventsData)
            } catch (error) {
                console.error("Error fetching events: ", error)
            }
        }
        fetchEvents()
    }, [user])

    function closeModal() {
        setIsOpen(false)
        setIsEditMode(false)
        setCurrentEventId(null)
    }

    function openModal() {
        setIsOpen(true)
    }

    const handleDateClick = (arg) => {
        const startDate = arg.date
        const endDate = new Date(startDate)
        endDate.setHours(startDate.getHours() + 1)
        
        setCurrentEvent({
            title: '',
            description: '',
            start: startDate,
            end: endDate,
            allDay: arg.allDay,
            backgroundColor: ''
        })
        
        openModal()
    }

    const handleSelect = (selectInfo) => {
        setCurrentEvent({
            title: '',
            description: '',
            start: selectInfo.start,
            end: selectInfo.end,
            allDay: selectInfo.allDay,
            backgroundColor: selectInfo.color
        })
        openModal()
    }

    const handleEventClick = (clickInfo) => {
        setCurrentEvent({
            title: clickInfo.event.title,
            description: clickInfo.event.extendedProps.description,
            start: clickInfo.event.start,
            end: clickInfo.event.end || clickInfo.event.start,
            allDay: clickInfo.event.allDay,
            backgroundColor: clickInfo.event.backgroundColor
        })
        setCurrentEventId(clickInfo.event.id)
        setIsEditMode(true)
        openModal()
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setCurrentEvent(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleTimeChange = (e) => {
        const { name, value } = e.target
        const time = value.split(':')
        
        setCurrentEvent(prev => {
            const newDate = new Date(prev[name])
            newDate.setHours(parseInt(time[0]))
            newDate.setMinutes(parseInt(time[1]))
            
            return {
                ...prev,
                [name]: newDate
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const eventData = {
                title: currentEvent.title,
                description: currentEvent.description,
                start: currentEvent.start,
                end: currentEvent.end,
                allDay: currentEvent.allDay,
                backgroundColor: currentEvent.backgroundColor,
                userId: user.uid 
            }

            if (isEditMode && currentEventId) {
                 const eventToUpdate = events.find(e => e.id === currentEventId)
                if (eventToUpdate?.userId !== user.uid) {
                    alert("You can only update your own events")
                    return
                }

                await updateDoc(doc(db, 'events', currentEventId), eventData)
                
                setEvents(events.map(event => 
                    event.id === currentEventId ? { ...event, ...eventData } : event
                ))
            } else {
                const docRef = await addDoc(collection(db, 'events'), eventData)
                setEvents([...events, { id: docRef.id, ...eventData }])
            }
            
            closeModal()
        } catch (error) {
            console.error("Error saving event: ", error)
        }
    }

    const handleDeleteEvent = async () => {
         if (!currentEventId || !user) return
        
        try {
            // Verify the event belongs to the current user before deleting
            const eventToDelete = events.find(e => e.id === currentEventId)
            if (eventToDelete?.userId !== user.uid) {
                alert("You can only delete your own events")
                return
            }

            await deleteDoc(doc(db, 'events', currentEventId))
            setEvents(events.filter(event => event.id !== currentEventId))
            closeModal()
        } catch (error) {
            console.error("Error deleting event: ", error)
        }
    }

    return (
        <div className='flex flex-col h-screen max-w-screen dark:bg-gray-900'>
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
                        enterTo="opacity-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 opacity-25 bg-blue-600" />
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
                                    
                                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                Event Title
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
                                            <input
                                                type="text"
                                                name="description"
                                                id="description"
                                                value={currentEvent.description}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">
                                                    Start Time
                                                </label>
                                                <input
                                                    type="time"
                                                    name="start"
                                                    id="start-time"
                                                    required
                                                    value={currentEvent.start ? currentEvent.start.toTimeString().substring(0, 5) : ''}
                                                    onChange={handleTimeChange}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">
                                                    End Time
                                                </label>
                                                <input
                                                    type="time"
                                                    name="end"
                                                    id="end-time"
                                                    required
                                                    value={currentEvent.end ? currentEvent.end.toTimeString().substring(0, 5) : ''}
                                                    onChange={handleTimeChange}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="allDay"
                                                id="allDay"
                                                checked={currentEvent.allDay}
                                                onChange={(e) => setCurrentEvent(prev => ({...prev, allDay: e.target.checked}))}
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
    )
}

function renderEventContent(eventInfo) {
    return (
        <>
            <div className="p-1">
                <b>{eventInfo.event.title}</b>
                {eventInfo.event.extendedProps?.description && (
                    <p className="text-xs">{eventInfo.event.extendedProps.description}</p>
                )}
                {!eventInfo.event.allDay && (
                    <p className="text-xs">{eventInfo.timeText}</p>
                )}
            </div>
        </>
    )
}

export default Calendar