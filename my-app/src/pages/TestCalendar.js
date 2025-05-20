import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";

export default function TestCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [fields, setFields] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({ objectName: "" });
  const [formErrors, setFormErrors] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);
  const formattedDate = selectedDate.toLocaleDateString('sv-SE'); // ISO-like format: YYYY-MM-DD
  const eventsForSelectedDate = events.filter(e => e.date === formattedDate);

  useEffect(() => {
  fetchEvents();
  fetchEventSchema();
}, []);

useEffect(() => {
  // Update formValues whenever selectedDate changes
  setFormValues(prev => ({
    ...prev,
    EventDate: formattedDate
  }));
}, [selectedDate, formattedDate]);

  

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

          return {
            id: event.objectId,
            title: getPropValue("EventTitle") || event.objectName || "No Title",
            date: getPropValue("EventDate"),
            location: getPropValue("Location") || ""
          };
        });
        setEvents(calendarEvents);
      })
      .catch(console.error);
  };

  const fetchEventSchema = async () => {
    try {
      const response = await axios.get('http://localhost:5291/api/Settings');
      const schema = response.data;
      const settings = schema?.$values?.[0];
      const applications = settings?.applications?.$values?.[0];
      const objectTypes = applications?.objectType?.$values;
      if (!objectTypes) return;
      const eventType = objectTypes.find(ot => ot.name === "Event");
      if (!eventType) return;
      const fields = eventType?.fields?.$values || [];
      setFields(fields);
      
      // Initialize form values with empty strings and EventDate prefilled
      const initialValues = { objectName: "" };
      fields.forEach(f => {
        initialValues[f.fieldName] = f.fieldName === "EventDate" ? formattedDate : "";
      });
      setFormValues(initialValues);
    } catch (error) {
      console.error("Failed to fetch schema:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if(type === "checkbox"){
      // Support for checkbox as comma separated string
      const currentValue = formValues[name] || "";
      const values = currentValue ? currentValue.split(",") : [];
      if(checked){
        values.push(value);
      } else {
        const idx = values.indexOf(value);
        if(idx > -1) values.splice(idx, 1);
      }
      setFormValues(prev => ({ ...prev, [name]: values.join(",") }));
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if(!formValues.objectName || formValues.objectName.trim() === ""){
      errors.objectName = "Object name is required";
    }
    // Add more validations if needed
    return errors;
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if(Object.keys(errors).length > 0){
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    // Build objectProperties array from formValues except objectName
    const objectProperties = Object.entries(formValues)
      .filter(([key]) => key !== "objectName")
      .map(([field, value]) => ({ field, value }));

    const payload = {
      objectType: "Event",
      objectName: formValues.objectName,
      objectProperties
    };

    try {
      await axios.post("http://localhost:5291/api/Object/PostObject", payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      fetchEvents();
      setShowForm(false);
      // Reset form values (keep EventDate for convenience)
      setFormValues(prev => ({
        objectName: "",
        ...fields.reduce((acc, f) => {
          acc[f.fieldName] = f.fieldName === "EventDate" ? formattedDate : "";
          return acc;
        }, {})
      }));
    } catch (err) {
      console.error("Failed to create event:", err.response?.data || err.message);
      setSaveError(err.response?.data?.message || err.message || "Failed to save");
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  const renderField = (field) => {
    const label = field.fieldName;
    const editor = field.editor?.toLowerCase() || 'text';
    const options = field.defaults ? field.defaults.split(',').map(opt => opt.trim()) : [];
    const value = formValues[label] || "";

    switch (editor) {
      case 'text':
      case 'number':
      case 'email':
      case 'date':
        return (
          <div key={label}>
            <label>{label}</label>
            <input
              type={editor}
              name={label}
              value={value}
              onChange={handleChange}
            />
          </div>
        );
      case 'select':
        return (
          <div key={label}>
            <label>{label}</label>
            <select name={label} value={value} onChange={handleChange}>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      case 'checkbox':
        return (
          <div key={label}>
            <label>{label}</label>
            {options.map(opt => (
              <label key={opt}>
                <input
                  type="checkbox"
                  name={label}
                  value={opt}
                  checked={value.split(',').includes(opt)}
                  onChange={handleChange}
                />
                {opt}
              </label>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div key={label}>
            <label>{label}</label>
            {options.map(opt => (
              <label key={opt}>
                <input
                  type="radio"
                  name={label}
                  value={opt}
                  checked={value === opt}
                  onChange={handleChange}
                />
                {opt}
              </label>
            ))}
          </div>
        );
      default:
        return (
          <div key={label}>
            <label>{label}</label>
            <input
              type="text"
              name={label}
              value={value}
              onChange={handleChange}
            />
          </div>
        );
    }
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

        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Avbryt" : "Skapa nytt event"}
        </button>

        {showForm && (
          <form
            onSubmit={handleCreateEvent}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "400px",
              marginTop: "20px"
            }}
          >
            <div>
              <label>Event Title (objectName): *</label>
              <input
                type="text"
                name="objectName"
                value={formValues.objectName}
                onChange={handleChange}
                required
              />
              {formErrors.objectName && <span style={{ color: "red" }}>{formErrors.objectName}</span>}
            </div>
            {fields.map(field => renderField(field))}
            <button type="submit">Skapa Event</button>
            {saveError && <div style={{ color: "red" }}>{saveError}</div>}
            {saved && <div style={{ color: "green" }}>✅ Event saved!</div>}
          </form>
        )}
      </div>
    </div>
  );
}
