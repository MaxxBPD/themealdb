import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formType, setFormType] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
        setIsLoggedIn(true);
    }
    if (user_id === 'guest') {
      setIsGuest(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('http://localhost:3000/attempt-login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Login failed');
            });
        }
    })
    .then(data => {
        console.log(data);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        if (getFavorites()) {
            localStorage.setItem('favorites', JSON.stringify(getFavorites()));
        }
        navigate('/home');
    })
    .catch(error => {
        console.error('Error:', error);
        setErrorMessage(error.message);
    });
  };

  const getFavorites = () => {
    const userId = localStorage.getItem('user_id');
    fetch(`http://localhost:3000/get-favorites?user_id=${userId}`, {  
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
    .catch(error => console.error('Error fetching favorites:', error));
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
    }
    if (username.length < 6) {
        setErrorMessage('Username must be at least 6 characters long');
        return;
    }
    if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        return;
    }
    fetch('http://localhost:3000/create-account', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Account creation failed');
            });
        }
    })
    .then(data => {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('username', data.username);
        navigate('/home');
    })
    .catch(error => {
        console.error('Error:', error);
        setErrorMessage(error.message);
    });
  };

  const continueAsGuest = () => {
    localStorage.setItem('user_id', 'guest');
    localStorage.setItem('username', 'Guest');
    localStorage.setItem('favorites', '{}');
    navigate('/home');
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('favorites');
  };

  const clearUserState = () => {
    setIsLoggedIn(false);
    setFormType('');
    setErrorMessage('');
    setUsername('');
    setPassword('');
  };

  return (
    <>
    {isLoggedIn ? (
        <>
            <h2>You are already logged in as {localStorage.getItem('username')}</h2>
            <div className="login-container">
                <button className="continue-button" onClick={() => navigate('/home')}>Continue to Recipe Finder</button>
                <button className="login-button" onClick={() => {clearLocalStorage(); clearUserState(); setFormType('login');}}>Log in as New User</button>
                <button className="create-account-button" onClick={() => {clearLocalStorage(); clearUserState(); setFormType('create');}}>Create Account</button>
                {!isGuest ? <button className="guest-button" onClick={continueAsGuest}>Continue as Guest</button> : null}
            </div>
        </>
    ) : (
        <>
            <h2>Welcome to the MealDB Recipe Finder!</h2>
            <div className="login-container">
                <button className="login-button" onClick={() => {setFormType('login'); setErrorMessage(''); setUsername(''); setPassword('');}}>Login</button>
                <button className="create-account-button" onClick={() => {setFormType('create'); setErrorMessage(''); setUsername(''); setPassword(''); setConfirmPassword('');}}>Create Account</button>
                <button className="guest-button" onClick={continueAsGuest}>Continue as Guest</button>
            </div>
        </>
    )}
    {errorMessage && <p className="error-message">{errorMessage}</p>}
    {formType === 'login' && (
        <div className="login-container">
            <form className="login-form">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={16}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength={16}
                    />
                </div>
                <div className="button-group">
                    <button onClick={handleLogin} className="login" disabled={!username || !password}>Login</button>
                </div>
            </form>
        </div>
    )}
    {formType === 'create' && (
        <div className="login-container">
            <form className="login-form">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={16}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength={16}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className="button-group">
                    <button onClick={handleCreateAccount} className="create" disabled={!username || !password || !confirmPassword}>Create Account</button>
                </div>
            </form>
        </div>
    )}
    </>
  );
}

export default Login;
