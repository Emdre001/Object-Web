import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dateClick
import axios from "axios";
import '../styles/calendar.css';

export default function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5291/api/Object/by-type/event")
      .then(response => {
        const eventsArray = response.data.$values;
        const calendarEvents = eventsArray.map(event => {
          const props = event.objectProperties.$values;
          const getPropValue = (fieldName) => {
            const prop = props.find(p => p.field === fieldName);
            return prop ? prop.value : null;
          };

          const allDay = getPropValue("AllDayEvent") === "True";
          const eventDate = getPropValue("EventDate");
          const startTime = getPropValue("StartTime");
          const stopTime = getPropValue("StopTime");
          const title = getPropValue("EventTitle") || event.objectName || "No Title";
          const location = getPropValue("Location") || "";

          let start, end;
          if (allDay) {
            start = eventDate;
          } else if (eventDate && startTime) {
            const startISOTime = startTime.replace('.', ':') + ":00";
            start = `${eventDate}T${startISOTime}`;
            if (stopTime) {
              const endISOTime = stopTime.replace('.', ':') + ":00";
              end = `${eventDate}T${endISOTime}`;
            }
          }

          return { id: event.objectId, title, start, end, allDay, location };
        });
        setEvents(calendarEvents);
      })
      .catch(console.error);
  }, []);

  // Handle user clicking a day on calendar
  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr); // YYYY-MM-DD format
  };

  // Filter events for selected date
  const eventsForSelectedDate = selectedDate
    ? events.filter(event => {
        // For allDay events, start is YYYY-MM-DD
        if (event.allDay) return event.start === selectedDate;

        // For timed events, compare date part of start string
        return event.start.startsWith(selectedDate);
      })
    : [];

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={events}
        dateClick={handleDateClick}
        height="auto"
      />

      {selectedDate && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
          <h2>Events on {selectedDate}</h2>
          {eventsForSelectedDate.length === 0 ? (
            <p>No events this day.</p>
          ) : (
            <ul>
              {eventsForSelectedDate.map(event => (
                <li key={event.id} style={{ marginBottom: "10px" }}>
                  <strong>{event.title}</strong><br />
                  {event.allDay ? (
                    <em>All Day</em>
                  ) : (
                    <span>
                      Time: {event.start.slice(11,16)} - {event.end ? event.end.slice(11,16) : "N/A"}
                    </span>
                  )}<br />
                  Location: {event.location || "N/A"}
                </li>
              ))}
            </ul>
          )}

          <button onClick={() => setSelectedDate(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
