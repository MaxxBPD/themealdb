import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formType, setFormType] = useState('');
  const navigate = useNavigate();

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
        navigate('/home');
    })
    .catch(error => {
        console.error('Error:', error);
        setErrorMessage(error.message);
    });
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
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
        navigate('/home');
    })
    .catch(error => {
        console.error('Error:', error);
        setErrorMessage(error.message);
    });
  };

  const continueAsGuest = () => {
    navigate('/home');
  };

  return (
    <>
    <h2>Welcome to the MealDB Recipe Finder!</h2>
    <div className="login-container">
        <button className="login-button" onClick={() => {setFormType('login'); setErrorMessage(''); setUsername(''); setPassword('');}}>Login</button>
        <button className="create-account-button" onClick={() => {setFormType('create'); setErrorMessage(''); setUsername(''); setPassword(''); setConfirmPassword('');}}>Create Account</button>
        <button className="guest-button" onClick={continueAsGuest}>
            Continue as Guest
        </button>
    </div>
    {errorMessage && <p className="error-message">{errorMessage}</p>}
    {formType === 'login' && (
        <div className="login-container">
            <form className="login-form">
                {loginError && <p className="error-message">{errorMessage}</p>}
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
            <div className="login-container">
                <form className="login-form">
                    {loginError && <p className="error-message">{errorMessage}</p>}
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
        </div>
    )}
    </>
  );
}

export default Login;
