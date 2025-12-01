import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaRandom } from 'react-icons/fa';

import { meals } from '../data/meals';

const NimaOvqat = () => {
    const [currentMeal, setCurrentMeal] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [recentlyShown, setRecentlyShown] = useState([]);

    // Show random meal on initial load
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * meals.length);
        setCurrentMeal(meals[randomIndex]);
        setRecentlyShown([meals[randomIndex].id]);

        // Remove from recently shown after 10 seconds
        setTimeout(() => {
            setRecentlyShown([]);
        }, 10000);
    }, []);

    const getRandomMeal = () => {
        setIsAnimating(true);

        // 1. Select the next meal immediately
        // Filter out current meal AND recently shown meals
        const availableMeals = meals.filter(meal =>
            meal.id !== currentMeal?.id && !recentlyShown.includes(meal.id)
        );

        let selectedMeal;
        let newRecentlyShown = [...recentlyShown];

        // If all meals have been shown, reset the recently shown list
        if (availableMeals.length === 0) {
            newRecentlyShown = [];
            // Pick from all meals except current
            const resetAvailable = meals.filter(meal => meal.id !== currentMeal?.id);
            const randomIndex = Math.floor(Math.random() * resetAvailable.length);
            selectedMeal = resetAvailable[randomIndex];
        } else {
            // Pick a random meal from available options
            const randomIndex = Math.floor(Math.random() * availableMeals.length);
            selectedMeal = availableMeals[randomIndex];
        }

        // 2. Preload the image
        const img = new Image();
        img.src = selectedMeal.image;

        // 3. Wait for BOTH animation (500ms) AND image load
        Promise.all([
            new Promise(resolve => setTimeout(resolve, 500)),
            new Promise(resolve => {
                if (img.complete) resolve();
                else {
                    img.onload = resolve;
                    img.onerror = resolve; // Proceed even if error
                }
            })
        ]).then(() => {
            // 4. Update state only when ready
            setCurrentMeal(selectedMeal);

            // Update recently shown logic
            if (availableMeals.length === 0) {
                setRecentlyShown([selectedMeal.id]);
            } else {
                setRecentlyShown([...newRecentlyShown, selectedMeal.id]);
            }

            // Set timeout to remove from recently shown
            setTimeout(() => {
                setRecentlyShown(prev => prev.filter(id => id !== selectedMeal.id));
            }, 10000);

            setIsAnimating(false);
        });
    };

    return (
        <div className="nima-ovqat-container">
            <Link to="/" className="back-button">
                <FaArrowLeft /> Orqaga
            </Link>

            <h1 className="app-title">Nima Ovqat?</h1>

            <div className="meal-display">
                {currentMeal && (
                    <div className={`meal-card ${isAnimating ? 'fade-out' : 'fade-in'}`}>
                        <img src={currentMeal.image} alt={currentMeal.title} className="meal-image" />
                        <h2 className="meal-title">{currentMeal.title}</h2>
                    </div>
                )}
            </div>

            <button className="random-btn" onClick={getRandomMeal} disabled={isAnimating}>
                <FaRandom /> Nima yeymiz?
            </button>

            {/* All Meals Grid */}
            <h2 className="all-meals-title">Bugun bizda qanday ovqatlar mavjud?</h2>
            <div className="meals-grid">
                {meals.map(meal => (
                    <div key={meal.id} className="meal-grid-card">
                        <img src={meal.image} alt={meal.title} className="meal-grid-image" />
                        <h3 className="meal-grid-title">{meal.title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NimaOvqat;
