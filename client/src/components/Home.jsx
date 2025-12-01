import React from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaUtensils } from 'react-icons/fa';

const Home = () => {
    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Choose an App</h1>
            <div className="cards-grid">
                <Link to="/youtube-downloader" className="app-card youtube-card">
                    <div className="card-icon">
                        <FaYoutube />
                    </div>
                    <h2>YouTube Downloader</h2>
                    <p>Download videos easily</p>
                </Link>

                <Link to="/nima-ovqat" className="app-card food-card">
                    <div className="card-icon">
                        <FaUtensils />
                    </div>
                    <h2>Nima Ovqat?</h2>
                    <p>Random Uzbek meal generator</p>
                </Link>
            </div>
        </div>
    );
};

export default Home;
