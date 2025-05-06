import { useParams, Outlet } from 'react-router-dom';

export function EditObjectPage() {
    const { objectID } = useParams();
    return <div>Editing object: {objectID}</div>;
  }