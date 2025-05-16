import { useParams, Outlet, useLocation } from 'react-router-dom';
import './styles/footer.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

function AppLayout() {
  const { appID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);

  const isHomepage = location.pathname === `/${appID}/` || location.pathname === `/${appID}`;
  const validApp = !!appID && appID.length > 2;

  // Scroll to the top when pages change 
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  if (!validApp) {
    return <div>Invalid App ID</div>;
  }
  
  return (
    <div className="App">
      <header className="top-nav">
        <div className="nav-left">
          <button className="home-btn" onClick={() => navigate(`/${appID}/`)}>🏠 Homepage</button>
        </div>
      </header>

      <main className="edit-page" ref={mainRef}>
        {!isHomepage && (
          <div className="sticky-back-button">
            <button type="button" className="back-button" onClick={() => navigate(-1)}>← Back</button>
          </div>
        )}
        <div className="calendar-padding">
          <Outlet />
        </div>
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
