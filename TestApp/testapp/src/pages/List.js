import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/list.css';

export function ListPage() {
  const { objectType } = useParams();
  const [objects, setObjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        const response = await fetch('http://localhost:5291/api/Object/all');
        if (!response.ok) throw new Error('Failed to fetch');
        const rawData = await response.json();
        const data = dereference(rawData);
        const list = Array.isArray(data) ? data : data?.$values;

        const filtered = list.filter(obj => obj.objectType === objectType);
        const sorted = filtered.sort((a, b) => a.objectName.localeCompare(b.objectName));
        setObjects(sorted);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Could not load data.');
      }
    };

    fetchObjects();
  }, [objectType]);

  return (
    <div className="object-list">
      <h2>{objectType} List</h2>
      {error && <div className="error">{error}</div>}
      <ul>
        {objects.map((obj, idx) => (
          <li key={idx} className="object-name">
            {obj.objectName}
          </li>
        ))}
      </ul>
    </div>
  );
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
