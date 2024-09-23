import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Named import

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
  
      console.log("Registration response:", response); // Debugging line
  
      if (response.status === 200) {
        console.log("Registration successful, navigating to List"); // Debugging line
        setErrorMessage('User registered successfully!');
        navigate('/List', {
          state: { userName: username } // Ensure this state is properly handled in the List component
        });
      } else {
        // Add a fallback to handle non-200 statuses
        setErrorMessage(response.data.detail || 'An error occurred during registration.');
      }
    } catch (error) {
      // Add more detailed error handling
      if (error.response) {
        console.error("Error during registration:", error.response.data); // Detailed logging
        setErrorMessage(error.response.data.detail || 'An unexpected error occurred.');
      } else if (error.request) {
        console.error("No response received:", error.request); // Detailed logging
        setErrorMessage('No response received from server.');
      } else {
        console.error("Error setting up request:", error.message); // Detailed logging
        setErrorMessage('Error setting up request.');
      }
    }
  };
  
  

  const handleLogin = async () => {
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
       console.error("Error during login:", error.message);
       if (error.response) {
          setErrorMessage(error.response.data.detail || 'Login failed.');
       } else if (error.request) {
          setErrorMessage('No response received from server.');
       } else {
          setErrorMessage('Login failed.');
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
            {password.length === 0 && (
              <p className="text-red-500 text-xs italic">Please choose a password.</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
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
