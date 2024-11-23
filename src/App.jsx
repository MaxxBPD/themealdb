import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MealDetails from './MealDetails'; // Import the new component
import HomePage from './HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Your main page component */}
        <Route path="/meal/:idMeal" element={<MealDetails />} /> {/* New route for meal details */}
      </Routes>
    </Router>
  )
}

export default App
