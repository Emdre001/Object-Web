import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import '../styles/list.css';

export function ListPage2() {
  const { objectType, appID } = useParams();
  const navigate = useNavigate();
  const [objects, setObjects] = useState([]);
  const [fields, setFields] = useState([]);
  const [error, setError] = useState(null);
  const [sortModel, setSortModel] = useState([
    { field: 'objectName', sort: 'asc' }
  ]);

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        const res = await fetch('http://localhost:5291/api/Object/all');
        if (!res.ok) throw new Error('Failed to fetch');
        const raw = await res.json();
        const data = dereference(raw);
        const list = Array.isArray(data) ? data : data?.$values;

        const filtered = list.filter(o => o.objectType.toLowerCase() === objectType.toLowerCase());
        const sorted = filtered.sort((a, b) =>
          a.objectName.localeCompare(b.objectName)
        );

        // collect columns
        const fieldSet = new Set();
        sorted.forEach(o => {
          const propsArr = getPropertiesArray(o.objectProperties);
          propsArr.forEach(p => p.field && fieldSet.add(p.field));
        });

        setFields(Array.from(fieldSet));
        // add rows
        setObjects(sorted);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Could not load data.');
      }
    };

    fetchObjects();
  }, [objectType]);

  // build grid columns
  const columns = useMemo(() => {
    const base = [
      {
        field: 'objectName',
        headerName: 'Object Name',
        width: 200,
        sortable: true,
        renderCell: params => (
          <Link
            to={`/${appID}/object/${params.row.objectId}`}
            state={{ objectData: params.row }}
          >
            {params.value}
          </Link>
        )
      }
    ];

    const dynamic = fields.map(f => ({
      field: f,
      headerName: f,
      width: 150,
      sortable: true
    }));

    return [...base, ...dynamic];
  }, [fields, appID]);

  // build grid rows
  const rows = useMemo(() => {
    return objects.map(o => {
      const propsArr = getPropertiesArray(o.objectProperties);
      const row = { id: o.objectId, objectId: o.objectId, objectName: o.objectName };
      propsArr.forEach(p => p.field && (row[p.field] = p.value));
      return row;
    });
  }, [objects]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
          sorting: { sortModel }
        }}
        pageSizeOptions={[10, 25, 50]}
        checkboxSelection
        disableRowSelectionOnClick
        onSortModelChange={model => setSortModel(model)}
      />
    </Box>
  );
}

function getPropertiesArray(objProps) {
  if (!objProps) return [];
  if (Array.isArray(objProps)) return objProps;
  if (Array.isArray(objProps.$values)) return objProps.$values;
  return [];
}

function dereference(obj) {
  const idMap = new Map();
  function traverse(cur) {
    if (cur && typeof cur === 'object') {
      if (cur.$ref) return idMap.get(cur.$ref);
      if (cur.$id) idMap.set(cur.$id, cur);
      if (Array.isArray(cur.$values)) {
        return cur.$values.map(traverse);
      }
      Object.keys(cur).forEach(key => {
        cur[key] = traverse(cur[key]);
      });
    }
    return cur;
  }
  return traverse(obj);
}
