import {BrowserRouter as Router, Routes, Route, Navigate, Outlet, useParams} from 'react-router-dom';
import AppLayout from "./AppLayout";
import { HomePage } from './pages/Home';
import { ListPage } from './pages/List';
import { ObjectPage } from './pages/Object';
import { EditObjectPage } from './pages/EditObject';
import { NotFound } from './pages/NotFound';
import './styles/App.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/defaultAppID" />} />
        <Route path="/:appID/*" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="list/:objectType" element={<ListPage />} />
          <Route path="object/:objectID" element={<ObjectPage />} />
          <Route path="object/:objectID/edit" element={<EditObjectPage />} />
          {/* Add fallback for 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;