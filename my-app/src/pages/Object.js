import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/object.css';

export function ObjectPage() {
  const { objectID } = useParams();
  const [objectData, setObjectData] = useState(null);
  const [children, setChildren] = useState([]);
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

    const fetchChildren = async () => {
  try {
    const response = await fetch(`http://localhost:5291/api/Object/get-children/${objectID}`);
    if (!response.ok) throw new Error('Failed to fetch children');
    const rawData = await response.json();
    const data = dereference(rawData);
    const list = Array.isArray(data) ? data : data?.$values || [];
    const sortedChildren = list.sort((a, b) =>
      a.objectName.localeCompare(b.objectName)
    );
    setChildren(sortedChildren);
  } catch (err) {
    console.error('Error fetching children:', err);
  }
};
    fetchObject();
    fetchChildren();
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
        <Link to={`edit`} className="edit-icon"><i className="fas fa-edit"></i></Link>
      </div>

      <ul>
        {objectProperties?.map((prop, index) => (
          <li key={index}>
            <strong>{prop.field}:</strong> {prop.value}
          </li>
        ))}
      </ul>

      {/* --- CHILDREN SECTION (only shown if children exist) --- */}
      {children.length > 0 && (
        <div className="children-section">
          <h3>Children</h3>
          <ul className="children-list">
            {children.map(child => (
              <li key={child.objectId}>
                {child.objectName} ({child.objectType})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Same dereference function as in ListPage
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
