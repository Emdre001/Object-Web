import './App.css';
import { useState } from 'react';


function App() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState(null);

  const [objects, setObjects] = useState([]);
  const [objectTypeFilter, setObjectTypeFilter] = useState(null);

 const handleFetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5291/api/Settings');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      console.log('Fetched settings:', data); 
      setSettings(data); // Set the settings data to state
      setSettingsLoaded(true); 
      setError(null); // Reset any previous errors
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Settings not found, please try agaian.');
    }
  };

  const handleFetchObjects = async (filterType) => {
    try {
      const response = await fetch('http://localhost:5291/api/Object/all');
      if (!response.ok) throw new Error('Failed to fetch test data');
      const data = await response.json();
  
      const filtered = data.filter(obj => obj.objectType === filterType);
      setObjects(filtered);
      setObjectTypeFilter(filterType);
      setSelectedObjectType(null); 
      setError(null);
    } catch (error) {
      console.error('Error fetching test data:', error);
      setError('Kunde inte hämta testdata.');
    }
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
 {/* Object type buttons (Person/Company) */}
 {settingsLoaded && settings?.applications?.$values?.length > 0 && (
          <div className="object-type-buttons">
            {settings.applications.$values[0].objectType?.$values?.map((objectType, idx) => (
              <button
                key={idx}
                className="btn object-btn"
                onClick={() => handleFetchObjects(objectType.name)}
              >
                {objectType.name}
              </button>
            ))}
          </div>
        )}
     {objects.length > 0 && (
          <div className="object-list">
            <h2>{objectTypeFilter === "Employee" ? "Persons" : "Companies"} List</h2>
            <ul>
              {objects.map((obj, idx) => (
                <li key={idx}>
                  <strong>{obj.objectName}</strong>
                  <ul>
                    {obj.objectProperties?.map((prop, propIdx) => (
                      <li key={propIdx}>
                        {prop.field}: {prop.value}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      {settingsLoaded && settings?.applications?.$values?.length > 0 && (
        <div className="object-type-buttons">
          {settings.applications.$values[0].objectType?.$values?.map((objectType, idx) => (
            <button
              key={idx}
              className="btn object-btn"
              onClick={() => setSelectedObjectType(objectType)}
            >
              {objectType.name}
            </button>
          ))}
        </div>
      )}

      {selectedObjectType && (
        <div className="object-type-fields">
          <h3>{selectedObjectType.name} Fields:</h3>
          <ul>
            {selectedObjectType.fields?.$values?.map((field, fieldIdx) => (
              <li key={fieldIdx}>
                <strong>{field.fieldName}</strong>: {field.editor}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
      <footer className="App-footer">
        <p>© {new Date().getFullYear()} Test Data Importer. All rights reserved. Made by Nicole & Emil</p>
      </footer>
    </div>
  );
}

export default App;

