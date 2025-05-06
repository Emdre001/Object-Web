import { useParams, Outlet } from 'react-router-dom';

export function ObjectPage() {
    const { objectID } = useParams();
    return <div>Viewing object: {objectID}</div>;
  }