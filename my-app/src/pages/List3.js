import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';

const ListPage3 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5291/api/Object/by-type/Person')
      .then(response => {
        const rawPersons = response.data["$values"];
        const transformed = rawPersons.map(person => {
          const props = person.objectProperties["$values"];
          const getValue = (fieldName) => {
            const prop = props.find(p => p.field === fieldName);
            return prop ? prop.value : '';
          };

          return {
            id: person.objectId,
            name: person.objectName,
            email: getValue("E-Mail"),
            gender: getValue("Gender"),
            phone: getValue("Phonenumber"),
            registrationDate: getValue("Registration Date"),
          };
        });
        setData(transformed);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const columns = [
    { name: 'Name', selector: row => row.name, sortable: true },
    { name: 'Email', selector: row => row.email, sortable: true },
    { name: 'Gender', selector: row => row.gender, sortable: true },
    { name: 'Phone', selector: row => row.phone, sortable: true },
    { name: 'Registration Date', selector: row => row.registrationDate, sortable: true },
  ];

  return (
    <div className="p-4">
      <h2>Persons</h2>
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

export default ListPage3;
