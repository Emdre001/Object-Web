import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/App.css';

export function HomePage() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const navigate = useNavigate();
  const { appID } = useParams();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5291/api/Settings');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const resolvedData = dereference(data);
        setSettings(resolvedData);
        setSettingsLoaded(true);
        setError(null);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Settings not found, please try again.');
      }
    };

    fetchSettings(); // Run automatically on component mount
  }, []);

  return (
  <div className="App-header">
    <h1>Welcome to our app!</h1>
    <h3>Found Applications:</h3>
    {settingsLoaded && settings?.[0]?.settingEntityName && (
      <h3>{settings[0].settingEntityName}</h3>
    )}
    {!settingsLoaded && !error && <p>Loading settings...</p>}
    {error && <div className="error">{error}</div>}

    {settingsLoaded && (
      <div className="button-row">
        {settings?.[0]?.applications?.[0]?.objectType?.map((objectType, idx) => (
          <button
            key={idx}
            className="btn object-btn"
            onClick={() =>
              navigate(
                objectType.name === "Event"
                  ? `/${appID}/Calendar/Event`
                  : `/${appID}/list/${objectType.name}`
              )
            }
          >
            {objectType.name}
          </button>
        ))}
      </div>
    )}
  </div>
);
}

function dereference(obj) {
  const idMap = new Map();
  function traverse(current) {
    if (current && typeof current === 'object') {
      if (current.$ref) return idMap.get(current.$ref);
      if (current.$id) idMap.set(current.$id, current);
      if (Array.isArray(current.$values)) {
        return current.$values.map(traverse);
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
