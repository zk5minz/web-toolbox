import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ImageConverter from './pages/ImageConverter';
import Notepad from './pages/Notepad';
import CharacterCounter from './pages/CharacterCounter';
import PasswordGenerator from './pages/PasswordGenerator';
import StopwatchTimer from './pages/StopwatchTimer';
import NumberCounter from './pages/NumberCounter';
import WorldClock from './pages/WorldClock';
import ScientificCalculator from './pages/ScientificCalculator';
import BackgroundRemover from './pages/BackgroundRemover';
import QRGenerator from './pages/QRGenerator';
import ColorExtractor from './pages/ColorExtractor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image-converter" element={<ImageConverter />} />
        <Route path="/notepad" element={<Notepad />} />
        <Route path="/character-counter" element={<CharacterCounter />} />
        <Route path="/password-generator" element={<PasswordGenerator />} />
        <Route path="/stopwatch-timer" element={<StopwatchTimer />} />
        <Route path="/number-counter" element={<NumberCounter />} />
        <Route path="/world-clock" element={<WorldClock />} />
        <Route path="/scientific-calculator" element={<ScientificCalculator />} />
        <Route path="/background-remover" element={<BackgroundRemover />} />
        <Route path="/qr-generator" element={<QRGenerator />} />
        <Route path="/color-extractor" element={<ColorExtractor />} />
      </Routes>
    </Router>
  );
}

export default App;
