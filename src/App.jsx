import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ImageConverter from './pages/ImageConverter';
import Notepad from './pages/Notepad';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image-converter" element={<ImageConverter />} />
        <Route path="/notepad" element={<Notepad />} />
      </Routes>
    </Router>
  );
}

export default App;
