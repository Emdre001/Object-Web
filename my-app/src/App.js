/*import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/

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
        <button className="btn customer-btn" onClick={handleImportCustomers}>Customers</button>
          <button className="btn person-btn" onClick={handleImportPersons}>Persons</button>
        </div>
      </header>
    </div>
  );
}

export default App;

