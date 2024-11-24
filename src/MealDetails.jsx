import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

function MealDetails() {
  const { idMeal } = useParams();
  const location = useLocation();
  const { searchTerm, ingredient, results, currentPage } = location.state || {};
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`)
      .then(response => response.json())
      .then(data => {
        setSelectedMeal(data.meals[0]);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [idMeal]);

  if (!selectedMeal) return <p>Loading...</p>;

  return (
    <div style={{ margin: '20px', padding: '15px', border: '1px solid #ccc' }}>
      <h4>{selectedMeal.strMeal}</h4>
      <img src={selectedMeal.strMealThumb} alt={selectedMeal.strMeal} style={{ width: '200px' }} />
      <p><strong>Category:</strong> {selectedMeal.strCategory}</p>
      <p><strong>Area:</strong> {selectedMeal.strArea}</p>
      <p><strong>Instructions:</strong></p>
      <p>{selectedMeal.strInstructions}</p>
      <p><strong>Ingredients:</strong></p>
      <ul>
        {Array.from({ length: 20 }, (_, i) => i + 1)
          .filter(i => selectedMeal[`strIngredient${i}`])
          .map(i => (
            <li key={i}>
              {selectedMeal[`strIngredient${i}`]} - {selectedMeal[`strMeasure${i}`]}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default MealDetails;
