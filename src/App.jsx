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
import AudioConverter from './pages/AudioConverter';
import VideoConverter from './pages/VideoConverter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import About from './pages/About';
import Contact from './pages/Contact';

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
        <Route path="/audio-converter" element={<AudioConverter />} />
        <Route path="/video-converter" element={<VideoConverter />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
