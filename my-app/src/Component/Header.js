import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Header = ({ userName }) => {
  const navigate = useNavigate();
  const [storedUserName, setStoredUserName] = useState('');

  // On component mount, load userName from localStorage
  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      setStoredUserName(savedUserName);
    } else if (userName) {
      setStoredUserName(userName);
      localStorage.setItem('userName', userName); // Store the username
    }
  }, [userName]);

  // Prevent back/forward navigation and redirect to List page
  useEffect(() => {
    const handlePopState = (e) => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/'); // Redirect to login page if no token
      } else {
        navigate('/List'); // Redirect to List page if token exists
      }
    };

    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    localStorage.removeItem('userName'); // Remove userName from localStorage
    navigate('/'); // Redirect to login page
  };

  return (
    <header className="bg-blue-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Welcome, {storedUserName}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
