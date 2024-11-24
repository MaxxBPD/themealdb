import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './Login';
import MealDetails from './MealDetails'; // Import the new component
import HomePage from './HomePage';

function App() {
  return (
    <Router>
      <Routes key={location.pathname} location={location}>
        <Route path="/" element={<Login />} /> {/* Your main page component */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/meal/:idMeal" element={<MealDetails />} /> {/* New route for meal details */}
      </Routes>
    </Router>
  )
}

export default App
