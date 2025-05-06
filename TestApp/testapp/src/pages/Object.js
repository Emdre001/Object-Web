import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
      <p><strong>Typ:</strong> {objectType}</p>
      <p><strong>ID:</strong> {objectID}</p>

      <h3>Egenskaper</h3>
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
