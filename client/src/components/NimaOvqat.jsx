import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaRandom } from 'react-icons/fa';

const meals = [
    {
        id: 1,
        title: 'Osh',
        image: 'https://images.unsplash.com/photo-1671048116858-e8ef69175b2d?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: 2,
        title: 'Lag\'mon',
        image: 'https://zira.uz/wp-content/uploads/2018/10/lagman-gotovoe-blyudo.jpg'
    },
    {
        id: 3,
        title: 'Manti',
        image: 'https://images.unsplash.com/photo-1756821753259-eb8abcdda9a3?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
        id: 4,
        title: 'Sho\'rva',
        image: 'https://api-portal.gov.uz/uploads/a3ad99dc-7938-408a-0306-64446234132b_media_.jpg'
    },
    {
        id: 5,
        title: 'Somsa',
        image: 'https://api-portal.gov.uz/uploads/3089a08e-7386-8eff-abe7-fadfea45ce96_media_.jpg'
    },
    {
        id: 6,
        title: 'Chuchvara',
        image: 'https://as1.ftcdn.net/v2/jpg/02/32/38/54/1000_F_232385404_fq5uOgpY5wwDNANIS4DYicAM736DJnCp.jpg'
    },
    {
        id: 7,
        title: 'Dimlama',
        image: 'https://punguskitchen.com/wp-content/uploads/2024/12/Dimlama-the-flavorful-and-hearty-Central-Asian-stew.jpg'
    },
    {
        id: 8,
        title: 'Norin',
        image: 'https://zira.uz/wp-content/uploads/2018/07/norin-1.jpg'
    },
    {
        id: 9,
        title: 'Qozon Kabob',
        image: 'https://i.ytimg.com/vi/y-9E_OJP2Dk/hq720.jpg?sqp=-…ADIQj0AgKJD&rs=AOn4CLAIXt1rTSBo94Ixqac7L7HVXxPIAg'
    },
    {
        id: 10,
        title: 'Shashlik',
        image: 'https://api-portal.gov.uz/uploads/23f4a656-39f6-8b09-8997-f5ebd2fc6a4f_media_.jpg'
    },
    {
        id: 11,
        title: 'Achchiq-chuchuk',
        image: 'https://api-portal.gov.uz/uploads/a6782ca4-a8f5-4619-e6ba-c14463cd9dab_media_.jpg'
    },
    {
        id: 12,
        title: 'Xamir xasip',
        image: 'https://zira.uz/wp-content/uploads/2019/03/xamir-hosip.jpg'
    },
    {
        id: 13,
        title: 'Mampar',
        image: 'https://zira.uz/wp-content/uploads/2019/09/mampar-6.jpg'
    },
    {
        id: 14,
        title: 'Mastava',
        image: 'https://yt3.googleusercontent.com/THCXMzfm84CLkYkKi148AO9or0r947GxwiQrIr8KgB9KbKs3YsC4gEhpn46krzzhGnhpcIP4XSk=s900-c-k-c0x00ffffff-no-rj'
    },
    {
        id: 15,
        title: 'Qo\'vurma sho\'rva',
        image: 'https://zira.uz/wp-content/uploads/2020/01/kovurma-shurpa-3.jpg'
    },
    {
        id: 16,
        title: 'Tovuq kabob',
        image: 'https://i.ytimg.com/vi/BCpF2kuHzbc/hq720.jpg?sqp=-…ADIQj0AgKJD&rs=AOn4CLAXZAdGiTHnQzo6DJw31MQr1KgwVA'
    },
    {
        id: 17,
        title: 'Tok oshi',
        image: 'https://i.ytimg.com/vi/xTAKrwcnu9s/hq720.jpg?sqp=-…ADIQj0AgKJD&rs=AOn4CLDvq66D61qJ03Q4kTCeKSVdnNCegg'
    },
    {
        id: 18,
        title: 'Xonim',
        image: 'https://i.pinimg.com/1200x/ee/f2/df/eef2df6a5a9218df846526fdf2679e79.jpg'
    },
    {
        id: 19,
        title: 'Makaron jarkob',
        image: 'https://i.ytimg.com/vi/PwAij2OE4EQ/hq720.jpg?sqp=-…ADIQj0AgKJD&rs=AOn4CLDgqfjA1PxeL401tThRZyZhK7U3jw'
    },
    {
        id: 20,
        title: 'Balish',
        image: 'https://zira.uz/wp-content/uploads/2020/05/zhurnal-pirog-balish-artel-2-.jpg'
    },
    {
        id: 21,
        title: 'Spaghetti',
        image: 'https://lilluna.com/wp-content/uploads/2025/10/spaghetti-recipe-resize-9-768x512.jpg'
    },
    {
        id: 22,
        title: 'Bo\'rsh',
        image: 'https://zira.uz/wp-content/uploads/2018/11/borw-3-1.jpg'
    },
    {
        id: 23,
        title: 'Burger toviqli',
        image: 'https://zira.uz/wp-content/uploads/2023/05/gamburger-s-kuricey.jpg'
    },
    {
        id: 24,
        title: 'Burger go\'shtli',
        image: 'https://zira.uz/wp-content/uploads/2019/06/burger.jpg'
    },
    {
        id: 25,
        title: 'Lavash',
        image: 'https://zira.uz/wp-content/uploads/2023/12/burger-iz-lavasha.jpg'
    },
    {
        id: 26,
        title: 'Omlet',
        image: 'https://zira.uz/wp-content/uploads/2020/05/kabachkovyy-omlet-s-pomidorami-3.jpg'
    },
    {
        id: 27,
        title: 'Menemen',
        image: 'https://zira.uz/wp-content/uploads/2019/09/tureckaya-yaichnica-zhurnal-2.jpg'
    },
];

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
        setTimeout(() => {
            // Filter out current meal AND recently shown meals
            const availableMeals = meals.filter(meal =>
                meal.id !== currentMeal?.id && !recentlyShown.includes(meal.id)
            );

            // If all meals have been shown, reset the recently shown list
            if (availableMeals.length === 0) {
                setRecentlyShown([]);
                // Pick from all meals except current
                const resetAvailable = meals.filter(meal => meal.id !== currentMeal?.id);
                const randomIndex = Math.floor(Math.random() * resetAvailable.length);
                const selectedMeal = resetAvailable[randomIndex];
                setCurrentMeal(selectedMeal);

                // Add to recently shown with 10-second timeout
                setRecentlyShown([selectedMeal.id]);
                setTimeout(() => {
                    setRecentlyShown(prev => prev.filter(id => id !== selectedMeal.id));
                }, 10000);
            } else {
                // Pick a random meal from available options
                const randomIndex = Math.floor(Math.random() * availableMeals.length);
                const selectedMeal = availableMeals[randomIndex];
                setCurrentMeal(selectedMeal);

                // Add to recently shown list
                setRecentlyShown(prev => [...prev, selectedMeal.id]);

                // Remove from recently shown after 10 seconds
                setTimeout(() => {
                    setRecentlyShown(prev => prev.filter(id => id !== selectedMeal.id));
                }, 10000);
            }

            setIsAnimating(false);
        }, 500);
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
