import { React, useState, useEffect } from 'react'
import './HomePage.css'
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [ingredient, setIngredient] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || {});
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [firstRun, setFirstRun] = useState(true); // Use state for firstRun

  const navigate = useNavigate();
  const resultsPerPage = 5;

  const baseUrl = 'https://www.themealdb.com/api/json/v1/1/'
  const apiKey = '1';
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
    } else {
      updatedFavorites[idMeal] = strMeal;
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

  const handleReadMore = (idMeal) => {
    fetch(`${baseUrl}lookup.php?i=${idMeal}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setSelectedMeal(data.meals[0]);
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  return (
    <>
      <div>
        <div>
          <h3>Your Favorite Meals</h3>
          <ul>
            {Object.entries(favorites).map(([idMeal, strMeal], index) => (
              <li key={index}>
                  {strMeal}
                  <button onClick={() => handleFavoriteToggle(meal.idMeal, meal.strMeal)}>
                    {'Unmark Favorite'}
                  </button>
              </li>
            ))}
          </ul>
        </div>
        <input 
          onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
          placeholder="Enter search term..."
          style={{ margin: '10px', padding: '5px' }}
        />
        <input 
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
                  <button onClick={() => handleFavoriteToggle(meal.idMeal, meal.strMeal)}>
                    {favorites[meal.idMeal] ? 'Unmark Favorite' : 'Mark Favorite'}
                  </button>
                  <button onClick={() => navigate(`/meal/${meal.idMeal}`)}>
                  Read More
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
    </>
  )
}

export default HomePage
