import { useParams, Outlet } from 'react-router-dom';
import './styles/footer.css';
import { useNavigate } from 'react-router-dom';

function AppLayout() {
  const { appID } = useParams();
  const navigate = useNavigate();

  if (!isValidAppID(appID)) {
    return <div>Invalid App ID</div>;
  }

  return (
    <div className="App">
      <header className="top-nav">
        <div className="nav-left">
          <button className="home-btn" onClick={() => navigate(`/${appID}/`)}>🏠 Homepage</button>
        </div>
      </header>

      <main className="edit-page">
        <Outlet />
      </main>

      <footer className="App-footer">
        <p>© {new Date().getFullYear()} Test Data Importer. All rights reserved. Made by Nicole & Emil</p>
      </footer>
    </div>
  );
}

function isValidAppID(id) {
  return !!id && id.length > 2;
}

export default AppLayout;
