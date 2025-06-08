import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Add from './pages/Add';
import EditModal from './pages/EditModal'; // Gunakan nama yang benar
import './index.css';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add" element={<Add />} />
      <Route path="/edit/:id" element={<EditModal />} /> {/* Gunakan EditModal */}
    </Routes>
  );
};

export default App;