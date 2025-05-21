import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/form.css';

export function NewPersonForm() {
  const { appID, objectType } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState({ objectName: '' });
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const REQUIRED_FIELDS = ['objectName'];

  // Editor map based on field name
  const editorMap = {
    phonenumber: 'number',
    active: 'select',
    gender: 'radio',
    'e-mail': 'email',
    'registration date': 'date'
  };

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await fetch('http://localhost:5291/api/Object/all');
        if (!response.ok) throw new Error('Failed to fetch');
        const rawData = await response.json();
        const data = dereference(rawData);
        const list = Array.isArray(data) ? data : data?.$values;

        const filtered = list.filter(obj => obj.objectType === objectType);
        const fieldSet = new Set();

        filtered.forEach(obj => {
          const props = getPropertiesArray(obj.objectProperties);
          props.forEach(p => {
            if (p.field) fieldSet.add(p.field);
          });
        });

        const fieldArray = Array.from(fieldSet);
        setFields(fieldArray);

        const initialFormValues = { objectName: '' };
        fieldArray.forEach(field => {
          initialFormValues[field] = '';
        });
        setFormValues(initialFormValues);
      } catch (err) {
        console.error(err);
        setError('Could not load the page.');
      }
    };

    fetchFields();
  }, [objectType]);

  function getPropertiesArray(objectProperties) {
    if (!objectProperties) return [];
    if (Array.isArray(objectProperties)) return objectProperties;
    if (Array.isArray(objectProperties.$values)) return objectProperties.$values;
    return [];
  }

  function dereference(obj) {
    const idMap = new Map();
    function traverse(current) {
      if (current && typeof current === 'object') {
        if (current.$ref) return idMap.get(current.$ref);
        if (current.$id) idMap.set(current.$id, current);
        if (Array.isArray(current.$values)) {
          current = current.$values.map(traverse);
        } else {
          for (const key in current) {
            current[key] = traverse(current[key]);
          }
        }
      }
      return current;
    }
    return traverse(obj);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  }

  function getEditorType(fieldName) {
    return editorMap[fieldName.toLowerCase()] || 'text';
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = {};
    REQUIRED_FIELDS.forEach(field => {
      if (!formValues[field] || formValues[field].trim() === '') {
        errors[field] = 'This field is required.';
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const objectProperties = Object.entries(formValues)
      .filter(([key]) => key !== 'objectName')
      .map(([field, value]) => ({ field, value }));

    const newObject = {
      objectName: formValues.objectName,
      objectType,
      objectProperties
    };

    try {
      const res = await fetch('http://localhost:5291/api/Object/PostObject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newObject)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Serverfel: ${res.status} - ${errorText}`);
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate(`/${appID}/list/${objectType}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setSaveError(err.message);
      setTimeout(() => setSaveError(null), 3000);
    }
  }

  return (
    <div className="new-form">
      <h2>Create new {objectType}</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label>Object Name: *</label>
          <input
            type="text"
            name="objectName"
            value={formValues.objectName}
            onChange={handleChange}
            required
          />
          {formErrors.objectName && <span className="error">{formErrors.objectName}</span>}
        </div>

        {/* Dynamic fields */}
        {fields.map(field => {
          const type = getEditorType(field);
          const value = formValues[field] || '';

          if (type === 'radio') {
            return (
              <div key={field}>
                <label>{field}:</label>
                <div className="radio-group">
                  {['Female', 'Male', 'Other'].map(option => (
                    <label key={option}>
                      <input
                        type="radio"
                        name={field}
                        value={option}
                        checked={value === option}
                        onChange={handleChange}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            );
          }

          if (type === 'select') {
            return (
              <div key={field}>
                <label>{field}:</label>
                <select name={field} value={value} onChange={handleChange}>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            );
          }

          return (
            <div key={field}>
              <label>{field}:</label>
              <input
                type={type}
                name={field}
                value={value}
                onChange={handleChange}
              />
            </div>
          );
        })}

        <button type="submit">Save</button>
        {saveError && <div className="error-message">{saveError}</div>}
        {saved && <div className="success-message">✅ Object saved! Redirecting...</div>}
      </form>
    </div>
  );
}
