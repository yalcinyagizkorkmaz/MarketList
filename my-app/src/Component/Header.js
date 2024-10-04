import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Header = ({ userName }) => {
  const navigate = useNavigate();

  // Geri/ileri navigasyonu önleyin ve List sayfasına yönlendirin
  useEffect(() => {
    const handlePopState = (e) => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/'); // Token yoksa giriş sayfasına yönlendir
      } else {
        // Token varsa List sayfasına yönlendir
        navigate('/List');
      }
    };

    // Geçerli sayfayı geçmişe ekle
    window.history.pushState(null, null, window.location.href);
    // Popstate olayına dinleyici ekle
    window.addEventListener('popstate', handlePopState);

    // Temizleme fonksiyonu
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // LocalStorage'dan token'ı kaldır
    navigate('/'); // Giriş sayfasına yönlendir
  };

  return (
    <header className="bg-blue-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">Welcome, {userName}</h1>
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
