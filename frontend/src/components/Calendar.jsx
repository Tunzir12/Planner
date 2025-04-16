import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick


const events = [
    { title: 'Meeting', start: new Date() },
    { title: 'shopping', start: new Date("March 17, 2025 15:24:00") },
]



const Calendar = () =>{

    const handleDateClick = (arg) => {
        // add event entry option
        <>
        <button>Add event</button>
        </>
        //alert(arg.dateStr)
      }
  return (
    <div className='p-10'>
        <div className="h-screen max-w-screen">
            <FullCalendar
                plugins={[dayGridPlugin , interactionPlugin]}
                dateClick={handleDateClick}
                initialView='dayGridMonth'
                weekends={true}
                events={events}
                eventContent={renderEventContent}
            />
        </div>
    </div>
  )
}

// a custom render function
function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  )
}

export default Calendar