import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from "./AppLayout";
import { HomePage } from './pages/Home';
import { ListPage } from './pages/List';
import { ListPage2 } from './pages/List2';
import { NewPersonForm } from './pages/NewPersonForm';
import ListPage3 from './pages/List3';
import { ObjectPage } from './pages/Object';
import { EditObjectPage } from './pages/EditObject';
import { NotFound } from './pages/NotFound';
import AppInitializer from './pages/AppInitializer';
import EventCalendar from './pages/listCalender';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppInitializer />} />
        <Route path="/:appID/*" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="list/:objectType" element={<ListPage />} />
          <Route path=":objectType/new" element={<NewPersonForm />} />
          <Route path="list2/:objectType" element={<ListPage2 />} />
          <Route path="listCalendar/:objectType" element={<EventCalendar />} />
          <Route path="list3/" element={<ListPage3 />} />
          <Route path="object/:objectID" element={<ObjectPage />} />
          <Route path="object/:objectID/edit" element={<EditObjectPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
