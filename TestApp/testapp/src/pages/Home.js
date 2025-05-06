import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';


function dereference(obj) {
  const idMap = new Map();

  function traverse(current) {
    if (current && typeof current === 'object') {
      // Handle $ref resolution
      if (current.$ref) {
        return idMap.get(current.$ref);
      }

      // Store objects with $id in the map
      if (current.$id) {
        idMap.set(current.$id, current);
      }

      // Process $values array separately if it exists
      if (Array.isArray(current.$values)) {
        current = current.$values.map(traverse);
      } else {
        for (const key in current) {
          current[key] = traverse(current[key]);
        }
      }
    }
    return current;
  }

  return traverse(obj);
}

export function HomePage() {
  const { appID } = useParams();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
    

    const handleFetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5291/api/Settings');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        console.log('Raw settings with $ref:', data);
  
        const resolvedData = dereference(data);
        console.log('Dereferenced settings:', resolvedData);
  
        setSettings(resolvedData);
        setSettingsLoaded(true);
        setError(null);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Settings not found, please try again.');
      }
    };  

  const goToCompanyList = () => {
    navigate(`list/company`);
  };

  return (
    <div className="App">
      <header className="top-nav">
        <div className="nav-left">
          <button className="home-btn" onClick={() => window.location.reload()}>🏠 Homepage</button>
        </div>
      </header>

      <header className="App-header">
        <div className="main-header">
        <h1>{settingsLoaded ? "Found Applications" : "Welcome to our app"}</h1>
        <h3>{appID}</h3>
        {settingsLoaded && settings?.[0]?.settingEntityName && (
          <h3>{settings[0].settingEntityName}</h3>
          )}

        </div>

        {!settingsLoaded && (
          <>
            <p>Press the button to start</p>
            <div className="button-group">
              <button className="btn settings-btn" onClick={handleFetchSettings}>⚙️ Get Settings</button>
            </div>
          </>
        )}

        {error && <div className="error">{error}</div>}
        </header>
        </div>
  );
}
