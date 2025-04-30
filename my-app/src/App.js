import logo from './logo.svg';
import './App.css';
import { useState } from 'react';


function App() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  const handleImportCustomers = () => {
    console.log('Import Customers clicked');
    // Här kan du lägga till API-anrop etc.
  };

  const handleImportPersons = () => {
    console.log('Import Persons clicked');
    // Här kan du lägga till API-anrop etc.
  };
 const handleFetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5291/api/Settings/getDemoSetting');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      console.log('Fetched settings:', data); 
      setSettings(data); // Set the settings data to state
      setError(null); // Reset any previous errors
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Kunde inte hämta inställningar. Försök igen.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to our app</h1>
        <p>Press the button to start</p>
        <div className="button-group">
        <button className="btn customer-btn" onClick={handleImportCustomers}>🏢 Customers</button>
          <button className="btn person-btn" onClick={handleImportPersons}>👤 Persons</button>
          <button className="btn settings-btn" onClick={handleFetchSettings}>⚙️ Get Settings</button>
        </div>
        {error && <div className="error">{error}</div>}

        {settings && (
          <div className="settings-output">
            <h2>Applications:</h2>
            {settings.applications?.$values?.length > 0 ? (
              <ul>
                 {settings.applications.$values.map((application, index) => (
                  <li key={index}>
                    <h3>{application.name}</h3>
                    <h4>Object Types:</h4>
                    <ul>
                      {application.objectType?.$values?.map((objectType, idx) => (
                        <li key={idx}>
                          <strong>{objectType.name}</strong>
                          <ul>
                            {application.objectType?.$values?.map((field, fieldIdx) => (
                              <li key={fieldIdx}>
                                <strong>{field.fieldName}</strong>: {field.editor}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No applications found.</p>
            )}
          </div>
        )}
      </header>
      <footer className="App-footer">
        <p>© {new Date().getFullYear()} Test Data Importer. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

