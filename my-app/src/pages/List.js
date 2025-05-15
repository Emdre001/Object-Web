import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/list.css';
import React from 'react';
import { DefaultList } from '../components/DefaultList';
import { MuiList } from '../components/MuiList';
import { ReactDataTable } from '../components/ReactDataTable';

export function ListPage() {
  const { objectType, appID } = useParams();
  const [objects, setObjects] = useState([]);
  const [fields, setFields] = useState([]);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('objectName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedRows, setExpandedRows] = useState({});
  const [childrenMap, setChildrenMap] = useState({});
  const [listViewer, setListViewer] = useState('DefaultList');

  const viewerComponentMap = {
    DefaultList,
    MuiList,
    ReactDataTable,
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:5291/api/Settings');
        if (!res.ok) throw new Error('Failed to fetch settings');
        const raw = await res.json();
        const settings = dereference(raw);

        const apps = settings?.[0]?.applications;
        const app = apps?.find(a => a.appId === appID);
        const object = app?.objectType?.find(o => o.name === objectType);

        if (object?.listViewer && viewerComponentMap[object.listViewer]) {
          setListViewer(object.listViewer);
        } else {
          setListViewer('DefaultList');
        }
      } catch (err) {
        console.error('Settings fetch error:', err);
        setListViewer('DefaultList');
      }
    };

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

    fetchSettings();
    fetchObjects();
  }, [objectType, appID]);

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

  const rows = objects.map((obj, index) => {
    const row = { id: obj.objectId, objectName: obj.objectName }; // IMPORTANT: use obj.objectId as id!
    const props = getPropertiesArray(obj.objectProperties);
    props.forEach(p => {
      if (p.field) row[p.field] = p.value;
    });
    return row;
  });

  const columns = [
    { field: 'objectName', headerName: 'Object Name', flex: 1 },
    ...fields.map(f => ({ field: f, headerName: f, flex: 1 }))
  ];

  const ListComponent = viewerComponentMap[listViewer] || DefaultList;

  return (
    <div className="object-list">
      <h2>{objectType} List</h2>
      {error && <div className="error">{error}</div>}
      <ListComponent
        {...(listViewer === 'DefaultList' && {
          objectType,
          appID,
          objects,
          fields,
          sortField,
          sortDirection,
          onSort: handleSort,
          expandedRows,
          onToggleExpand: fetchChildren,
          childrenMap,
        })}
        {...(listViewer === 'MuiList' && {
          rows,
          columns,
          appID,  // pass appID here so MuiList can use it for navigation
          sortModel: [{ field: sortField, sort: sortDirection }],
          onSortModelChange: (model) => {
            if (model.length > 0) {
              setSortField(model[0].field);
              setSortDirection(model[0].sort);
            }
          }
        })}
        {...(listViewer === 'ReactDataTable' && {
          title: `${objectType} List`,
          columns: columns.map(col => ({
            name: col.headerName,
            selector: row => row[col.field],
            sortable: true,
          })),
          data: rows,
          loading: false,
        })}
      />
    </div>
  );
}

// Deep dereferencing function for $ref/$id JSON
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
