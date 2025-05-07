import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/edit.css';

export function EditObjectPage() {
  const { objectID } = useParams(); // this is passed from the route
  const [fields, setFields] = useState([]);
  const [objectData, setObjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Reuse dereference function
  function dereference(obj) {
    const idMap = new Map();
    function traverse(current) {
      if (current && typeof current === 'object') {
        if (current.$ref) return idMap.get(current.$ref);
        if (current.$id) idMap.set(current.$id, current);
        if (Array.isArray(current.$values)) {
          return current.$values.map(traverse);
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

  useEffect(() => {
    async function loadObjectAndSchema() {
      try {
        // Step 1: Fetch the object to get its type
        const objRes = await fetch(`http://localhost:5291/api/Object/${objectID}`);
        if (!objRes.ok) throw new Error('Failed to fetch object data');
        const rawObject = await objRes.json();
        const object = dereference(rawObject);
        setObjectData(object);

        const objectTypeName = object.objectType;

        // Step 2: Fetch schema
        const schemaRes = await fetch('http://localhost:5291/api/Settings');
        if (!schemaRes.ok) throw new Error('Failed to fetch schema');
        const schema = await schemaRes.json();

        const objectTypes = schema["$values"][0].applications["$values"][0].objectType["$values"];
        const matchedType = objectTypes.find(ot => ot.name === objectTypeName);

        if (matchedType && matchedType.fields) {
          setFields(matchedType.fields["$values"]);
        } else {
          throw new Error(`ObjectType "${objectTypeName}" not found in schema`);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadObjectAndSchema();
  }, [objectID]);

  const renderField = (field) => {
    const label = field.fieldName;
    const editor = field.editor?.toLowerCase() || 'text';
    const options = field.defaults ? field.defaults.split(',').map(opt => opt.trim()) : [];
    const currentValue = objectData?.objectProperties?.find(p => p.field === label)?.value || '';
    
    switch (editor) {
      case 'text':
      case 'number':
      case 'email':
      case 'date':
        return (
          <div key={label}>
            <label>{label}</label>
            <input type={editor} name={label} defaultValue={currentValue} />
          </div>
        );

      case 'select':
        return (
          <div key={label}>
            <label>{label}</label>
            <select name={label} defaultValue={currentValue}>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        const selectedValues = currentValue.split(',');
        return (
          <div key={label}>
            <label>{label}</label>
            {options.map(opt => (
              <label key={opt}>
                <input
                  type="checkbox"
                  name={label}
                  value={opt}
                  defaultChecked={selectedValues.includes(opt)}
                /> {opt}
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
                  defaultChecked={currentValue === opt}
                /> {opt}
              </label>
            ))}
          </div>
        );

      default:
        return (
          <div key={label}>
            <label>{label}</label>
            <input type="text" name={label} defaultValue={currentValue} />
          </div>
        );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Simulerad sparlogik (byt till din riktiga)
      const res = await fetch('...', { method: 'POST', body: '' });
  
      if (!res.ok) {
        throw new Error('Error, could not save!');
      }
  
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
  
    } catch (err) {
      setSaveError(err.message);
      setTimeout(() => setSaveError(null), 3000);
    }
  };
  
  return (
    <div className="edit-page">
      <h2>Edit {objectData?.objectType} (ID: {objectID})</h2>
      <form onSubmit={handleSubmit}>
        {fields.map(field => renderField(field))}
        <button type="submit" className="btn object-btn">Save</button>
      </form>
      {saveError && <div className="error-message">{saveError}</div>}
      {saved && (<div className="success-message">✅ Saved successfully!</div>)}
    </div>
  );
}
