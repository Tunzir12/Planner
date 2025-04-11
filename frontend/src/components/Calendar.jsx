import { useState } from "react";

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const renderCalendar = () => {
        const DaysInMonth = getDaysInMonth(year, month);
        const FirstDayOfMonth = getFirstDayOfMonth(year, month);
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        const daysFromPrevMonth = FirstDayOfMonth;
        const prevMonthDays = getDaysInMonth(year, month - 1);

        const totalCells = Math.ceil((DaysInMonth + FirstDayOfMonth) / 7) * 7;
        const daysFromNextMonth = totalCells - (DaysInMonth + FirstDayOfMonth);

        const days = [];

        for(let i = 0; i < daysFromPrevMonth; i++){
            days.push({
                day: prevMonthDays - daysFromPrevMonth + i + 1,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthDays - daysFromPrevMonth + i + 1)
            });
        }

        for (let i = 1; i <= DaysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            });
        }

        for (let i = 1; i <= daysFromNextMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return (
            <>
                <div className="contents">
                    {dayNames.map(day => (
                        <div key={day} className="py-2 text-center font-medium bg-gray-100">
                            {day}
                        </div>
                    ))}
                </div>
                
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="contents">
                        {week.map((day, dayIndex) => (
                            <div 
                                key={dayIndex} 
                                className={`min-h-[100px] p-1 border border-gray-200 ${
                                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                                } hover:bg-gray-100`}
                                onClick={() => console.log('Day clicked:', day.date)}
                            >
                                <div className="text-right font-bold mb-1">{day.day}</div>
                            </div>
                        ))}
                    </div>
                ))}
            </>
        );
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth}>Previous</button>
                <h2>{monthName} {year}</h2>
                <button onClick={nextMonth}>Next</button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200">
                {renderCalendar()}
            </div>
        </div>
    );
};

export default Calendar;