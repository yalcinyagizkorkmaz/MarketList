import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // useLocation'ı import edin
import '../App.css';
import Header from './Header'; // Header bileşenini import edin

const ListSayfa = () => {
  const { state } = useLocation(); // useLocation hook'u ile state'i alın
  const userName = state?.userName || 'Guest'; // Kullanıcı adı veya varsayılan değer

  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState([]);

  const handleAddItem = (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini önler
    if (inputValue.trim() !== '') {
      setItems([...items, { text: inputValue, status: 'Pending' }]);
      setInputValue(''); // Input alanını temizler
    }
  };

  const handleDone = (index) => {
    const newItems = [...items];
    newItems[index].status = 'Done';
    setItems(newItems);
  };

  const handleUpdateStatus = (index) => {
    const newItems = [...items];
    newItems[index].status = newItems[index].status === 'Pending' ? 'In Progress' : 'Pending';
    setItems(newItems);
  };

  const handleDelete = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1); // İlgili öğeyi siler
    setItems(newItems);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header userName={userName} /> {/* Kullanıcı adını Header bileşenine geçirin */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Add Item to Market List</h2>
          <form className="flex space-x-4" onSubmit={handleAddItem}>
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-4 w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter item..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-4 text-lg rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </form>
          <ul className="mt-6 space-y-2">
            {items.map((item, index) => (
              <li 
                key={index} 
                className="flex items-center justify-between border-b border-gray-200 py-3 text-lg"
              >
                <span className={`flex-1 break-words ${item.status === 'Done' ? 'line-through text-gray-500' : ''}`}>
                  {item.text}
                </span>
                <div className="flex-shrink-0 flex space-x-2">
                  <button
                    onClick={() => handleDone(index)}
                    className="bg-green-500 text-white px-3 py-1 w-24 text-center rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(index)}
                    className="bg-yellow-500 text-white px-3 py-1 w-24 text-center rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-500 text-white px-3 py-1 w-24 text-center rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ListSayfa;
