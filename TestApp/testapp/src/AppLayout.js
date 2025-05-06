import { useParams, Outlet } from 'react-router-dom';
import './styles/footer.css';

function AppLayout() {
  const { appID } = useParams();

  // Optional: validate appID or fetch app data
  if (!isValidAppID(appID)) {
    return <div>Invalid App ID</div>; // or redirect
  }

  return (
    <div>
      <Outlet />
      <footer className="App-footer">
        <p>© {new Date().getFullYear()} Test Data Importer. All rights reserved. Made by Nicole & Emil</p>
      </footer>
    </div>
  );
}

function isValidAppID(id) {
  return !!id && id.length > 2; // Replace with real logic
}

export default AppLayout;