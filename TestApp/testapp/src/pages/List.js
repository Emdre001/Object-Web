import { useParams, Outlet } from 'react-router-dom';

export function ListPage() {
    const { objectType } = useParams();
    return <div>Listing objects of type: {objectType}</div>;
  }