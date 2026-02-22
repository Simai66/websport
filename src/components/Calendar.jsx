import { useState } from 'react';

export default function Calendar({ selectedDate, onDateSelect, maxDays = 30 }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Max booking date (30 days from today by default)
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxDays);

    const weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Add empty days for alignment
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add actual days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const formatDateStr = (date) => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const isDisabled = (date) => {
        if (!date) return true;
        return date < today || date > maxDate;
    };

    const isToday = (date) => {
        if (!date) return false;
        return formatDateStr(date) === formatDateStr(today);
    };

    const isSelected = (date) => {
        if (!date || !selectedDate) return false;
        return formatDateStr(date) === selectedDate;
    };

    const days = getDaysInMonth(currentMonth);

    return (
        <div className="calendar">
            <div className="calendar-header">
                <h3 className="calendar-title">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear() + 543}
                </h3>
                <div className="calendar-nav">
                    <button className="calendar-nav-btn" onClick={handlePrevMonth}>←</button>
                    <button className="calendar-nav-btn" onClick={handleNextMonth}>→</button>
                </div>
            </div>

            <div className="calendar-weekdays">
                {weekdays.map(day => (
                    <div key={day} className="calendar-weekday">{day}</div>
                ))}
            </div>

            <div className="calendar-days">
                {days.map((date, index) => (
                    <button
                        key={index}
                        className={`calendar-day ${isDisabled(date) ? 'disabled' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                        onClick={() => date && !isDisabled(date) && onDateSelect(formatDateStr(date))}
                        disabled={isDisabled(date)}
                    >
                        {date ? date.getDate() : ''}
                    </button>
                ))}
            </div>
        </div>
    );
}
