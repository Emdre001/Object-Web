import logo from './logo.svg';
import './App.css';

function App() {
  const handleImportCustomers = () => {
    console.log('Import Customers clicked');
    // Här kan du lägga till API-anrop etc.
  };

  const handleImportPersons = () => {
    console.log('Import Persons clicked');
    // Här kan du lägga till API-anrop etc.
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to our app</h1>
        <p>Press the button to start</p>
        <div className="button-group">
        <button className="btn customer-btn" onClick={handleImportCustomers}>🏢 Customers</button>
          <button className="btn person-btn" onClick={handleImportPersons}>👤 Persons</button>
        </div>
      </header>
    </div>
  );
}

export default App;

