import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/form.css';

export function NewPersonForm() {
  const { appID, objectType } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState({ objectName: '', status: '', gender: '', phoneNumber: '', email: '', registrationDate: '' });
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);


  const REQUIRED_FIELDS = ['objectName'];

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

        // Initiera formvärden
        const initialFormValues = { objectName: '' };
        fieldArray.forEach(field => {
          initialFormValues[field] = '';
        });
        setFormValues(initialFormValues);

      } catch (err) {
        console.error(err);
        setError('Kunde inte ladda fält.');
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

  async function handleSubmit(e) {
    e.preventDefault();
  
    const errors = {};
    REQUIRED_FIELDS.forEach(field => {
      if (!formValues[field] || formValues[field].trim() === '') {
        errors[field] = 'Detta fält är obligatoriskt.';
      }
    });
  
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
  
    const seen = new Set();
    const objectProperties = Object.entries(formValues)
  .filter(([key]) => key !== 'objectName' && seen.add(key)) // garanterar unika fält
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
        navigate(`/${appID}/${objectType}`);
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

    <div>
          <label>Status:</label>
          <select name="status" value={formValues.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label>Gender:</label>
          <div className="radio-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={formValues.gender === 'Female'}
              onChange={handleChange}
            /> Female
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={formValues.gender === 'Male'}
              onChange={handleChange}
            /> Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Other"
              checked={formValues.gender === 'Other'}
              onChange={handleChange}
            /> Other
          </label>
          </div>
        </div>

        <div>
        <div className="phone-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formValues.phoneNumber}
            onChange={handleChange}
          />
        </div>
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Registration Date:</label>
          <input
            type="date"
            name="registrationDate"
            value={formValues.registrationDate}
            onChange={handleChange}
          />
        </div>
        
        <button type="submit">Save</button>
        {saveError && <div className="error-message">{saveError}</div>}
        {saved && <div className="success-message">✅ Person saved! Redirecting...</div>}
      </form>
    </div>
  );
}
