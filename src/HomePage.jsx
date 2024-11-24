import { React, useState, useEffect } from 'react'
import './HomePage.css'
import { useNavigate, useLocation } from 'react-router-dom';

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [ingredient, setIngredient] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || {});
  const [firstRun, setFirstRun] = useState(true); // Use state for firstRun
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const resultsPerPage = 5;

  const baseUrl = 'https://www.themealdb.com/api/json/v1/1/'
  const apiKey = '1';

  useEffect(() => {
    const savedState = JSON.parse(sessionStorage.getItem('searchState'));
    if (savedState) {
      setSearchTerm(savedState.searchTerm || '');
      setIngredient(savedState.ingredient || '');
      setResults(savedState.results || []);
      setCurrentPage(savedState.currentPage || 1);
    }
  }, [location.state]);

  const handleSearch = () => {
    setFirstRun(false); // Update state to indicate a search has been attempted
    console.log('Search button clicked');
    let url = `${baseUrl}`;
    if (searchTerm && !ingredient) {
      url += `search.php?s=${searchTerm}`;
    } else if (ingredient && !searchTerm) {
      url += `filter.php?i=${ingredient}`;
    } else if (searchTerm && ingredient) {
      url += `search.php?s=${searchTerm}`;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (searchTerm && ingredient) {
          const filteredMeals = data.meals?.filter(meal => {
            const ingredientKeys = Object.keys(meal).filter(key => key.startsWith('strIngredient'));
            return ingredientKeys.some(key => {
              const ingredientValue = meal[key];
              return ingredientValue && ingredientValue.toLowerCase().includes(ingredient.toLowerCase());
            });
          });
          setResults(filteredMeals || []);
        } else {
          setResults(data.meals || []);
        }
        setCurrentPage(1); // Reset to first page on new search
      })
      .catch(error => console.error('Error fetching data:', error));

  }

  const handleFavoriteToggle = (idMeal, strMeal) => {
    const updatedFavorites = { ...favorites };
    if (favorites[idMeal]) {
      delete updatedFavorites[idMeal];
      if (!isGuest) {
        deleteFavorite(idMeal);
      }
    } else {
      updatedFavorites[idMeal] = strMeal;
      if (!isGuest) {
        saveFavorite(idMeal, strMeal);
      }
    }
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = results.slice(indexOfFirstResult, indexOfLastResult);

  const totalPages = Math.ceil(results.length / resultsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getFavorites = () => {
    const userId = localStorage.getItem('user_id');
    fetch(`http://localhost:3000/get-favorites?user_id=${userId}`, {  
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      console.log("favorites", data);
      // Convert the data to the desired format
      const formattedFavorites = data.reduce((acc, { idMeal, strMeal }) => {
        acc[idMeal] = strMeal;
        return acc;
      }, {});
      setFavorites(formattedFavorites);
    })
    .catch(error => console.error('Error fetching favorites:', error));
  };

  const saveFavorite = (idMeal, strMeal) => {
    fetch(`http://localhost:3000/save-favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: localStorage.getItem('user_id'), idMeal, strMeal })
    });
  };

  const deleteFavorite = (idMeal) => {
    fetch(`http://localhost:3000/delete-favorite`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: localStorage.getItem('user_id'), idMeal })
    });
  };

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const storedUsername = localStorage.getItem('username');
    if (userId === 'guest') {
      setIsGuest(true);
    }

    if (userId && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      if (!isGuest) {
        getFavorites();
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('favorites');
    sessionStorage.removeItem('searchState');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleViewRecipe = (idMeal) => {
    const stateToSave = {
      searchTerm,
      ingredient,
      results,
      currentPage,
    };
    sessionStorage.setItem('searchState', JSON.stringify(stateToSave));
    navigate(`/meal/${idMeal}`);
  };

  return (
    <>
      {isLoggedIn ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <h2>You are logged in as: {username}</h2>
            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div>
            <div>
              {favorites.length > 0 && <h3>Your Favorite Meals</h3>}
              <ul>
                {Object.entries(favorites).map(([idMeal, strMeal]) => (
                  <li key={idMeal}>
                    {strMeal}
                    <button className="favorite-button" onClick={() => handleFavoriteToggle(idMeal, strMeal)}>
                      {favorites[idMeal] ? 'Unmark Favorite' : 'Mark Favorite'}
                    </button>
                    <button className="view-recipe-button" onClick={() => handleViewRecipe(idMeal)}>
                      View Recipe
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Enter search term..."
              style={{ margin: '10px', padding: '5px' }}
            />
            <input 
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              type="text" 
              placeholder="Enter another search term..."
              style={{ margin: '10px', padding: '5px', color: 'red' }}
            />
            <button 
              onClick={handleSearch}
              style={{ margin: '10px', padding: '5px' }}
            >
              Search
            </button>
            <div>
              {currentResults.length > 0 ? (
                <ul>
                  {currentResults.map((meal, index) => (
                    <li key={index}>
                      {meal.strMeal}
                      <button className="favorite-button" onClick={() => handleFavoriteToggle(meal.idMeal, meal.strMeal)}>
                        {favorites[meal.idMeal] ? 'Unmark Favorite' : 'Mark Favorite'}
                      </button>
                      <button className="view-recipe-button" onClick={() => handleViewRecipe(meal.idMeal)}>
                        View Recipe
                      </button>
                    </li>
                  ))}
                </ul>
              ) : ( !firstRun && results.length === 0 && (
                <p>No results found</p>
              ))}
              {results.length > resultsPerPage && (
                <div>
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    &lt;
                  </button>
                  <span> Page {currentPage} of {totalPages} </span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>Redirecting to login...</p>
      )}
    </>
  )
}

export default HomePage
