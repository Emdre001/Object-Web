import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import '../styles/calendar.css'; 

export const Calendar = ({ rows, appID }) => {
  const navigate = useNavigate();

  const events = rows.map(row => ({
    id: row.id,
    title: row.EventTitle || row.objectName || 'No Title',
    start: row.EventDate || row.StartTime, 
    end: row.StopTime || row.EventDate,
    allDay: row.AllDayEvent === 'True',
    extendedProps: row,
  }));

  const handleEventClick = (info) => {
    const id = info.event.id;
    navigate(`/${appID}/object/${id}`, {
      state: { objectData: info.event.extendedProps }
    });
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />
    </div>
  );
};
