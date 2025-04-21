import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction"
import timeGridPlugin from '@fullcalendar/timegrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import { useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const Calendar = () => {

    const [isOpen, setIsOpen] = useState(false)
    const [newEvent, setNewEvent] = useState({
        title: '',
        start: '',
        end: '',
        allDay: false
    })
    
    const calendarRef = useRef(null)

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }

    const handleDateClick = (arg) => {
        // Set the initial start time to the clicked date/time
        const startDate = arg.date
        const endDate = new Date(startDate)
        endDate.setHours(startDate.getHours() + 1) // Default to 1 hour duration
        
        setNewEvent({
            title: '',
            start: startDate,
            end: endDate,
            allDay: arg.allDay
        })
        
        openModal()
    }

    const handleSelect = (selectInfo) => {
        setNewEvent({
            title: '',
            start: selectInfo.start,
            end: selectInfo.end,
            allDay: selectInfo.allDay
        })
        openModal()
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewEvent(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleTimeChange = (e) => {
        const { name, value } = e.target
        const time = value.split(':')
        
        setNewEvent(prev => {
            const newDate = new Date(prev[name])
            newDate.setHours(parseInt(time[0]))
            newDate.setMinutes(parseInt(time[1]))
            
            return {
                ...prev,
                [name]: newDate
            }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const calendarApi = calendarRef.current.getApi()
        
        calendarApi.addEvent({
            id: Date.now().toString(),
            title: newEvent.title,
            start: newEvent.start,
            end: newEvent.end,
            allDay: newEvent.allDay
        })
        
        closeModal()
    }

    return (
        <div className='grid grid-cols-5 h-screen max-w-screen'>
          <div className="col-span-1">

          </div>
            <div className=" col-span-4 pl-30 pr-30 pt-0">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, multiMonthPlugin]}
                    headerToolbar={{
                        start: 'prev,next',
                        center: 'title',
                        end: 'dayGridMonth,timeGridWeek,timeGridDay multiMonthYear'
                    }}
                    initialView='dayGridMonth'
                    weekends={true}
                    events={newEvent}
                    eventContent={renderEventContent}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dateClick={handleDateClick}
                    select={handleSelect}
                    multiMonthMaxColumns={3}
                />
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
                                        Add New Event
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
                                                value={newEvent.title}
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
                                                    value={newEvent.start ? newEvent.start.toTimeString().substring(0, 5) : ''}
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
                                                    value={newEvent.end ? newEvent.end.toTimeString().substring(0, 5) : ''}
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
                                                checked={newEvent.allDay}
                                                onChange={(e) => setNewEvent(prev => ({...prev, allDay: e.target.checked}))}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700">
                                                All-day event
                                            </label>
                                        </div>

                                        <div className="mt-4 flex justify-end space-x-3">
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
                                                Add Event
                                            </button>
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
            <b>{eventInfo.timeText}</b>
            <i>{eventInfo.event.title}</i>
        </>
    )
}

export default Calendar

