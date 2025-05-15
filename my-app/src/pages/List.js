import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/list.css';
import React from 'react';


export function ListPage() {
  const { objectType, appID } = useParams();
  const [objects, setObjects] = useState([]);
  const [fields, setFields] = useState([]);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('objectName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedRows, setExpandedRows] = useState({});
  const [childrenMap, setChildrenMap] = useState({});

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

        const fieldSet = new Set();
        sorted.forEach(obj => {
          const properties = getPropertiesArray(obj.objectProperties);
          properties.forEach(prop => {
            if (prop.field) fieldSet.add(prop.field);
          });
        });

        setFields(Array.from(fieldSet));
        setObjects(sorted);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Could not load data.');
      }
    };

    fetchObjects();
  }, [objectType]);

  const fetchChildren = async (objectId) => {
    try {
      const response = await fetch(`http://localhost:5291/api/Object/get-children/${objectId}`);
      if (!response.ok) throw new Error('Failed to fetch children');
      const rawData = await response.json();
      const data = dereference(rawData);
      const list = Array.isArray(data) ? data : data?.$values || [];

      setChildrenMap(prev => ({ ...prev, [objectId]: list }));
      setExpandedRows(prev => ({ ...prev, [objectId]: !prev[objectId] }));
    } catch (err) {
      console.error('Error fetching children:', err);
    }
  };

  const getSortedObjects = () => {
    const sorted = [...objects];
    sorted.sort((a, b) => {
      if (sortField === 'objectName') {
        return sortDirection === 'asc'
          ? a.objectName.localeCompare(b.objectName)
          : b.objectName.localeCompare(a.objectName);
      } else {
        const aValue = getValueFromField(a, sortField);
        const bValue = getValueFromField(b, sortField);

        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });
    return sorted;
  };

  function getValueFromField(obj, field) {
    const props = getPropertiesArray(obj.objectProperties);
    const match = props.find(p => p.field === field);
    return match?.value ?? '';
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function getPropertiesArray(objectProperties) {
    if (!objectProperties) return [];
    if (Array.isArray(objectProperties)) return objectProperties;
    if (Array.isArray(objectProperties.$values)) return objectProperties.$values;
    return [];
  }

  return (
    <div className="object-list">
      <h2>{objectType} List</h2>
      {error && <div className="error">{error}</div>}
      
      <table className="object-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('objectName')} style={{ cursor: 'pointer' }}>
              Object Name {sortField === 'objectName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            {fields.map((field, idx) => (
              <th key={idx} onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>
                {field} {sortField === field ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {getSortedObjects().map((obj, idx) => {
            const propMap = new Map();
            getPropertiesArray(obj.objectProperties).forEach(prop => {
              if (prop.field) propMap.set(prop.field, prop.value);
            });

            return (
              <React.Fragment key={idx}>
                <tr>
                  <td>
                    <div
                      className={`expand-button ${expandedRows[obj.objectId] ? 'expanded' : ''}`}
                      onClick={() => fetchChildren(obj.objectId)}
                    >
                      {expandedRows[obj.objectId] ? '▼' : '▶'} {obj.objectName}
                    </div>
                  </td>
                  {fields.map((field, i) => (
                    <td key={i}>{propMap.get(field) ?? '—'}</td>
                  ))}
                  <td>
                    <Link to={`/${appID}/object/${obj.objectId}`} state={{ objectData: obj }}>
                      View Details
                    </Link>
                  </td>
                </tr>

                {expandedRows[obj.objectId] && childrenMap[obj.objectId]
                  ?.slice() // create a copy to avoid mutating state
                  .sort((a, b) => a.objectName.localeCompare(b.objectName))
                  .map((child, childIdx) => {
                    const childProps = getPropertiesArray(child.objectProperties);
                    const childMap = new Map(childProps.map(p => [p.field, p.value]));

                    return (
                      <tr key={`child-${childIdx}`} className="child-row">
                        <td style={{ paddingLeft: '2em' }}>↳ {child.objectName}</td>
                        {fields.map((field, i) => (
                          <td key={i}>{childMap.get(field) ?? '—'}</td>
                        ))}
                        <td>
                          <Link to={`/${appID}/object/${child.objectId}`} state={{ objectData: child }}>
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
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
