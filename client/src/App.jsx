import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import YouTubeDownloader from './components/YouTubeDownloader';
import NimaOvqat from './components/NimaOvqat';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/youtube-downloader" element={<YouTubeDownloader />} />
        <Route path="/nima-ovqat" element={<NimaOvqat />} />
      </Routes>
    </Router>
  );
}

export default App;
