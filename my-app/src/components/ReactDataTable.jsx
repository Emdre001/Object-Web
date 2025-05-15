import React from 'react';
import DataTable from 'react-data-table-component';

export const ReactDataTable = ({ title, columns, data, loading = false }) => {
  return (
    <div className="p-4">
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        highlightOnHover
        dense
      />
    </div>
  );
};
