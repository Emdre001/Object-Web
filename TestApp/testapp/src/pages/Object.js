import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/object.css';

export function ObjectPage() {
  const { objectID } = useParams();
  const [objectData, setObjectData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchObject = async () => {
      try {
        const response = await fetch(`http://localhost:5291/api/Object/${objectID}`);
        if (!response.ok) throw new Error('Failed to fetch object');
        const rawData = await response.json();
        const data = dereference(rawData);
        setObjectData(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Could not load object.');
      }
    };

    fetchObject();
  }, [objectID]);

  if (error) return <div className="error">{error}</div>;
  if (!objectData) return <div>Loading...</div>;

  const { objectName, objectType, objectProperties } = objectData;

  return (
    <div className="object-detail">
      <h2>{objectName}</h2>
      <p><strong>ID:</strong> {objectID}</p>
      <p><strong>Type:</strong> {objectType}</p>

      <div className="properties-header">
    <h3>Properties</h3>
    <Link to={`edit`} className="edit-icon"><i className="fas fa-edit"></i> </Link>
  </div>
  
      <ul>
        {objectProperties?.map((prop, index) => (
          <li key={index}>
            <strong>{prop.field}:</strong> {prop.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Samma dereference-funktion som i ListPage
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
