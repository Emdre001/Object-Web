import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function AppInitializer() {
  const [appIDs, setAppIDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedAppID, setSelectedAppID] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5291/api/Settings')
      .then((res) => res.json())
      .then((data) => {
        // Step 1: access top-level $values
        const settings = data?.["$values"];
        if (!settings || !Array.isArray(settings)) {
          throw new Error("Invalid settings structure");
        }
  
        // Step 2: flatten all applications from each setting
        const apps = settings.flatMap((setting) => {
          const appList = setting?.applications?.["$values"];
          if (!Array.isArray(appList)) return [];
          return appList.map(app => ({
            appID: app.appId,
            name: app.name
          }));
        });
  
        if (apps.length === 0) {
          throw new Error("No applications found");
        }
  
        setAppIDs(apps);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to parse or fetch app IDs:', err);
        setError(true);
        setLoading(false);
      });
  }, []);
  

  if (loading) return <div>Loading...</div>;
  if (error || !Array.isArray(appIDs) || appIDs.length === 0) {
    return <div>Error: Unable to load App IDs.</div>;
  }

  // Auto-navigate if only one ID
  if (appIDs.length === 1) {
    return <Navigate to={`/${appIDs[0].appID}`} replace />;
  }

  // Navigate when user selects one
  if (selectedAppID) {
    return <Navigate to={`/${selectedAppID}`} replace />;
  }

  // Display selection list
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Select an App</h2>
      <ul>
        {appIDs.map(({ appID, name }) => (
          <li key={appID}>
            <button onClick={() => setSelectedAppID(appID)}>
              {name || appID}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AppInitializer;
