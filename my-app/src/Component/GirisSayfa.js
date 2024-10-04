import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode}from 'jwt-decode'; // Düzeltilmiş import

import '../App.css';

const GirisSayfa = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setErrorMessage('');
  
    const requestData = {
      username: username,
      userpassword: password,
    };
  
    try {
      const response = await axios.post('http://localhost:8000/register/', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 200) {
        setErrorMessage('User registered successfully!');
        // After successful registration, log in the user
        handleLogin();
      } else {
        setErrorMessage(response.data.detail || 'An error occurred during registration.');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          setErrorMessage('This user is already registered.');
        } else {
          setErrorMessage(error.response.data.detail || 'An unexpected error occurred.');
        }
      } else {
        setErrorMessage('Error setting up request.');
      }
    }
  };
  
  const handleLogin = async (event) => {
    event && event.preventDefault();
    setErrorMessage('');
  
    try {
      const response = await axios.post('http://localhost:8000/login/', {
        username,
        userpassword: password,
      });
  
      if (response.status === 200) {
        const token = response.data.access_token;
        localStorage.setItem('token', token);
  
        const decodedToken = jwtDecode(token);
        const user_id = decodedToken.user_id;
  
        navigate('/List', {
          state: { userName: username, user_id: user_id }
        });
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.detail || 'Login failed.');
      } else {
        setErrorMessage('No response received from server.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-xs">
        <h1 className="text-3xl font-bold text-center mb-4 border-b-2 border-gray-500 pb-2">
          Market List
        </h1>

        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleRegister}>
          {errorMessage && (
            <p className="text-red-500 text-xs italic mb-4">{errorMessage}</p>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleLogin} // Trigger login when clicked
            >
              Login
            </button>
            
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-l focus:outline-none focus:shadow-outline"
              type="submit" // Trigger registration when clicked
            >
              Sign Up
            </button>
          </div>
        </form>
        <p className="text-center text-gray-500 text-xs">
          &copy;2020 Acme Corp. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default GirisSayfa;
