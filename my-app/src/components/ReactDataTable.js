import React from 'react';
import DataTable from 'react-data-table-component';

const ReactDataTable = ({ title, columns, data, loading = false }) => {
  return (
    <div className="p-4">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
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

export default ReactDataTable;
