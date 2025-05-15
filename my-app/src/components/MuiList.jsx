import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/MuiList.css';

export const MuiList = ({ rows, columns, appID, sortModel, onSortModelChange }) => {
  const navigate = useNavigate();

  const handleViewDetails = (row) => {
    // Navigate to object page with appID and objectID, passing row data in state
    navigate(`/${appID}/object/${row.id}`, { state: { objectData: row } });
  };

  // Add an Action column with a View Details button
  const columnsWithAction = [
    ...columns,
    {
      field: 'actions',
      headerName: 'Action',
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <button onClick={() => handleViewDetails(params.row)}>View Details</button>
      ),
    },
  ];

  return (
    <div className="mui-list-container">
      <DataGrid
        rows={rows}
        columns={columnsWithAction}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        pageSizeOptions={[5, 10, 20]}
        pagination
      />
    </div>
  );
};
