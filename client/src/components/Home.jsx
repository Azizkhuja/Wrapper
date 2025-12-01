import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaUtensils, FaBars, FaTimes } from 'react-icons/fa';

const Home = () => {
    const [flagInput, setFlagInput] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const showYouTubeDownloader = flagInput === 'forme';

    return (
        <div className="dashboard-container">
            {/* Hamburger Menu Button */}
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
                <FaBars />
            </button>

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <button className="close-btn" onClick={() => setSidebarOpen(false)}>
                    <FaTimes />
                </button>

                <h3 className="sidebar-title">Sozlamalar</h3>

                <div className="sidebar-content">
                    <label className="sidebar-label">Kirish kodi:</label>
                    <input
                        type="text"
                        placeholder="Kirish kodini kiriting..."
                        value={flagInput}
                        onChange={(e) => setFlagInput(e.target.value)}
                        className="sidebar-input"
                    />
                </div>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
            )}

            <h1 className="dashboard-title">Ilovani tanlang</h1>

            <div className="cards-grid">
                {showYouTubeDownloader && (
                    <Link to="/youtube-downloader" className="app-card youtube-card">
                        <div className="card-icon">
                            <FaYoutube />
                        </div>
                        <h2>YouTube Downloader</h2>
                        <p>Download videos easily</p>
                    </Link>
                )}

                <Link to="/nima-ovqat" className="app-card food-card">
                    <div className="card-icon">
                        <FaUtensils />
                    </div>
                    <h2>Nima Ovqat?</h2>
                    <p>Bugun nima ovqat qilay?</p>
                </Link>
            </div>
        </div>
    );
};

export default Home;
