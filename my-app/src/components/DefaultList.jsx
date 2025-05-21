import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/list.css';

export function DefaultList({
  appID,
  objects,
  fields,
  sortField,
  sortDirection,
  onSort,
}) {
  function getPropertiesArray(objectProperties) {
    if (!objectProperties) return [];
    if (Array.isArray(objectProperties)) return objectProperties;
    if (Array.isArray(objectProperties.$values)) return objectProperties.$values;
    return [];
  }

  function getValueFromField(obj, field) {
    const props = getPropertiesArray(obj.objectProperties);
    const match = props.find(p => p.field === field);
    return match?.value ?? '';
  }

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

  return (
    <table className="object-table">
      <thead>
        <tr>
          <th onClick={() => onSort('objectName')} style={{ cursor: 'pointer' }}>
            Object Name {sortField === 'objectName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
          {fields.map((field, idx) => (
            <th key={idx} onClick={() => onSort(field)} style={{ cursor: 'pointer' }}>
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
            <tr key={idx}>
              <td>{obj.objectName}</td>
              {fields.map((field, i) => (
                <td key={i}>{propMap.get(field) ?? '—'}</td>
              ))}
              <td>
                <Link to={`/${appID}/object/${obj.objectId}`} state={{ objectData: obj }}>
                  View Details
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
