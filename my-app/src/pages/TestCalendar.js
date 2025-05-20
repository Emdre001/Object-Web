import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";

export default function TestCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", location: "" });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axios.get("http://localhost:5291/api/Object/by-type/event")
      .then(response => {
        const eventsArray = response.data.$values;
        const calendarEvents = eventsArray.map(event => {
          const props = event.objectProperties.$values;
          const getPropValue = (fieldName) => {
            const prop = props.find(p => p.field === fieldName);
            return prop ? prop.value : null;
          };

          const eventDate = getPropValue("EventDate");
          const title = getPropValue("EventTitle") || event.objectName || "No Title";
          const location = getPropValue("Location") || "";

          return {
            id: event.objectId,
            title,
            date: eventDate,
            location
          };
        });
        setEvents(calendarEvents);
      })
      .catch(console.error);
  };

  const formattedDate = selectedDate.toISOString().split("T")[0];
  const eventsForSelectedDate = events.filter(e => e.date === formattedDate);

  // Skapa nytt event
  const handleAddEvent = () => {
    const payload = {
      objectType: "event",
      objectName: newEvent.title || "Untitled",
      objectProperties: {
        $values: [
          { field: "EventDate", value: formattedDate },
          { field: "EventTitle", value: newEvent.title },
          { field: "Location", value: newEvent.location },
          { field: "AllDayEvent", value: "True" }
        ]
      }
    };

    axios.post("http://localhost:5291/api/Object/PostObject", payload)
      .then(() => {
        setNewEvent({ title: "", location: "" });
        fetchEvents(); // Hämta uppdaterad lista
      })
      .catch(console.error);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Calendar</h1>
      <Calendar onChange={setSelectedDate} value={selectedDate} />

      <div style={{ marginTop: "20px" }}>
        <h2>Event for {formattedDate}</h2>
        {eventsForSelectedDate.length === 0 ? (
          <p>Inga event denna dag.</p>
        ) : (
          <ul>
            {eventsForSelectedDate.map(event => (
              <li key={event.id}>
                <strong>{event.title}</strong><br />
                Location: {event.location}
              </li>
            ))}
          </ul>
        )}

        <h3>Lägg till nytt event</h3>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "300px", gap: "10px" }}>
          <input
            type="text"
            placeholder="Titel"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Plats"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          />
          <button onClick={handleAddEvent}>Skapa Event</button>
        </div>
      </div>
    </div>
  );
}
