import { useState } from 'react';
import axios from 'axios';
import { FaDownload, FaYoutube, FaSpinner, FaCloudDownloadAlt } from 'react-icons/fa';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState('');

  const handleFetchInfo = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const response = await axios.get(`${apiUrl}/info?url=${encodeURIComponent(url)}`);
      setVideoInfo(response.data);
    } catch (err) {
      setError('Failed to fetch video info. Please check the URL.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      window.location.href = `${apiUrl}/download?url=${encodeURIComponent(url)}`;
    } catch (err) {
      setError('Failed to download video.');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <FaYoutube size={74} />
          <div className="title">
            <h1>YT Downloader</h1>
            <FaCloudDownloadAlt size={44} />
          </div>
        </div>

        <form onSubmit={handleFetchInfo} className="input-group">
          <input
            type="text"
            placeholder="Paste YouTube Link Here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
          />
          <button type="submit" className="btn search-btn" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : 'Search'}
          </button>
        </form>

        {error && <div className="error-msg">{error}</div>}

        {videoInfo && (
          <div className="video-info">
            <img src={videoInfo.thumbnail} alt={videoInfo.title} className="thumbnail" />
            <div className="details">
              <h3>{videoInfo.title}</h3>
              <button onClick={handleDownload} className="btn download-btn">
                <FaDownload /> Download MP4
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
