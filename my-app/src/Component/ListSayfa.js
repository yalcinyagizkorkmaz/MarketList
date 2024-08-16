import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import axios from 'axios';
import '../App.css';
import Header from './Header'; 

const ListSayfa = () => {
  const { state } = useLocation();
  const userName = state?.userName || 'Guest';
  const userContext = state?.usercontext || 'DefaultContext'; // Default value
  const userStatus = state?.userstatus || 'Pending'; // Default value

  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState('');

  // Fetch all users on component mount
  useEffect(() => {
    axios.get('http://localhost:8000/users/')
      .then(response => {
        setItems(response.data.map(user => ({ 
          text: user.username, 
          status: user.userstatus,
          userId: user.user_id
        })));
      })
      .catch(error => {
        console.error("There was an error fetching the users!", error);
      });
  }, []);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      axios.post('http://localhost:8000/users/', {
        username: inputValue,
        userpassword: 'defaultpassword', // Assuming a default password
        userstatus: userStatus // Use the status from the login
      })
      .then(response => {
        setItems([...items, { text: response.data.username, status: response.data.userstatus, userId: response.data.user_id }]);
        setInputValue('');
      })
      .catch(error => {
        console.error("There was an error creating the user!", error);
      });
    }
  };

  const handleDone = (index) => {
    const item = items[index];
    axios.put(`http://localhost:8000/users/${item.userId}`, {
      username: item.text,
      userpassword: 'defaultpassword', // Keep the password same
      userstatus: 'Done'
    })
    .then(response => {
      const newItems = [...items];
      newItems[index].status = 'Done';
      setItems(newItems);
    })
    .catch(error => {
      console.error("There was an error updating the user!", error);
    });
  };

  const handleUpdateStatus = (index) => {
    setEditIndex(index);
    setEditText(items[index].text);
  };

  const handleSaveEdit = (index) => {
    const item = items[index];
    axios.put(`http://localhost:8000/users/${item.userId}`, {
      username: editText,
      userpassword: 'defaultpassword', // Keep the password same
      userstatus: 'Pending'
    })
    .then(response => {
      const newItems = [...items];
      newItems[index].text = editText;
      newItems[index].status = 'Pending';
      setItems(newItems);
      setEditIndex(null);
      setEditText('');
    })
    .catch(error => {
      console.error("There was an error updating the user!", error);
    });
  };

  const handleDelete = (index) => {
    const item = items[index];
    axios.delete(`http://localhost:8000/users/${item.userId}`)
    .then(() => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    })
    .catch(error => {
      console.error("There was an error deleting the user!", error);
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header userName={userName} />
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
                {editIndex === index ? (
                  <input
                    className="flex-1 border border-gray-300 rounded-lg p-2"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <span className={`flex-1 break-words ${item.status === 'Done' ? 'line-through text-gray-500' : ''}`}>
                    {item.text}
                  </span>
                )}
                <div className="flex-shrink-0 flex space-x-2">
                  {editIndex === index ? (
                    <button 
                      className="bg-green-500 text-white px-3 py-1 rounded-lg" 
                      onClick={() => handleSaveEdit(index)}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button 
                        className="bg-green-500 text-white px-3 py-1 rounded-lg" 
                        onClick={() => handleDone(index)}
                      >
                        Done
                      </button>
                      <button 
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg" 
                        onClick={() => handleUpdateStatus(index)}
                      >
                        Update
                      </button>
                    </>
                  )}
                  <button 
                    className="bg-red-500 text-white px-3 py-1 rounded-lg" 
                    onClick={() => handleDelete(index)}
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
