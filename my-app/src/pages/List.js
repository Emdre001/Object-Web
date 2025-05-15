import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import React from 'react';
import { DefaultList } from '../components/DefaultList'; // Adjust the path as needed

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
      if (childrenMap[objectId]) {
        // Toggle if children already fetched
        setExpandedRows(prev => ({ ...prev, [objectId]: !prev[objectId] }));
        return;
      }
      const response = await fetch(`http://localhost:5291/api/Object/get-children/${objectId}`);
      if (!response.ok) throw new Error('Failed to fetch children');
      const rawData = await response.json();
      const data = dereference(rawData);
      const list = Array.isArray(data) ? data : data?.$values || [];

      setChildrenMap(prev => ({ ...prev, [objectId]: list }));
      setExpandedRows(prev => ({ ...prev, [objectId]: true }));
    } catch (err) {
      console.error('Error fetching children:', err);
    }
  };

  function getPropertiesArray(objectProperties) {
    if (!objectProperties) return [];
    if (Array.isArray(objectProperties)) return objectProperties;
    if (Array.isArray(objectProperties.$values)) return objectProperties.$values;
    return [];
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleExpand = (objectId) => {
    fetchChildren(objectId);
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <DefaultList
        objectType={objectType}
        appID={appID}
        objects={objects}
        fields={fields}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        expandedRows={expandedRows}
        onToggleExpand={handleToggleExpand}
        childrenMap={childrenMap}
      />
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
