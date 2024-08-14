// Header.js
import React from 'react';
import '../App.css';


const Header = ({ userName }) => {
  return (
    <header className="bg-blue-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">Welcome, {userName}</h1>
      </div>
    </header>
  );
};

export default Header;
