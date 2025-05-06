import { useParams, Outlet } from 'react-router-dom';

export function ListPage() {
    const { objectType } = useParams();
    return ( <div>
    <h3>List Page</h3>
    Listing objects of type: {objectType}  
    </div>);
  }