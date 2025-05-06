import { useParams, Outlet } from 'react-router-dom';

function AppLayout() {
  const { appID } = useParams();

  // Optional: validate appID or fetch app data
  if (!isValidAppID(appID)) {
    return <div>Invalid App ID</div>; // or redirect
  }

  return (
    <div>
      <h1>App: {appID}</h1>
      {/* You can add a sidebar or header here */}
      <Outlet />
    </div>
  );
}

function isValidAppID(id) {
  return !!id && id.length > 2; // Replace with real logic
}
