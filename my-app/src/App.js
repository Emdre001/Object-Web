import './App.css';
import { useState } from 'react';

// Enhanced dereference function for complex structure with $id/$values references
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
      console.log('Raw settings with $ref:', data);

      // Dereference the settings to resolve $ref and $values
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

  const handleFetchObjects = async (filterType) => {
    try {
      const response = await fetch('http://localhost:5291/api/Object/all');
      if (!response.ok) throw new Error('Failed to fetch test data');
      const rawData = await response.json();
      const data = dereference(rawData);
      console.log('Dereferenced object data:', data);

      // Safely extract the array
      const objects = Array.isArray(data) ? data : data?.$values;

      if (!Array.isArray(objects)) {
        throw new Error('Could not extract array of objects from dereferenced data.');
      }

      const filtered = objects.filter(obj => obj.objectType === filterType);

  
      // Debugging log: Log the filtered objects
      console.log('Filtered objects:', filtered);
  
      setObjects(filtered);
      setObjectTypeFilter(filterType);
      setSelectedObjectType(null);  // Reset selected object type for fields display
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
        {settingsLoaded && settings?.[0]?.applications?.[0]?.objectType?.map((objectType, idx) => (
          <button
            key={idx}
            className="btn object-btn"
            onClick={() => handleFetchObjects(objectType.name)}
          >
            {objectType.name}
          </button>
        ))}

        {/* Display the list of objects based on the selected objectType */}
        {objects.length > 0 && (
          <div className="object-list">
            <h2>{objectTypeFilter === "Person" ? "Persons" : "Companies"} List</h2>
            <ul>
              {objects.map((obj, idx) => (
                <li key={idx}>
                  <strong>{obj.objectName}</strong>
                  <ul>
                    {(() => {
                      const propertiesArray = Array.isArray(obj.objectProperties)
                        ? obj.objectProperties
                        : obj.objectProperties?.$values;

                      return Array.isArray(propertiesArray)
                        ? propertiesArray.map((prop, propIdx) => (
                            <li key={propIdx}>
                              {prop.field}: {prop.value}
                            </li>
                          ))
                        : null;
                    })()}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Render the selected objectType's fields */}
        {selectedObjectType && (
          <div className="object-type-fields">
            <h3>{selectedObjectType.name} Fields:</h3>
            <ul>
              {selectedObjectType.fields?.map((field, fieldIdx) => (
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
