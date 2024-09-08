import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import Header from './Header';
import {jwtDecode} from 'jwt-decode';


const ListSayfa = () => {
  const { state } = useLocation();
  const userName = state?.userName || 'Guest';
  const userContext = state?.usercontext || 'null';
  const userStatus = state?.userstatus || 'Pending';
  const password = state?.password || ''; // Retrieve the password from state

  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState('');

  // Fetch all items on component mount
  useEffect(() => {
    axios.get('http://localhost:8000/list/')
      .then(response => {
        setItems(response.data.map(item => ({
          text: item.item_name,
          status: item.item_status,
          itemId: item.item_id
        })));
      })
      .catch(error => {
        console.error("There was an error fetching the items!", error);
      });
  }, []);
  const handleAddItem = (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token'); // Get the JWT token from localStorage
    const decodedToken = jwtDecode(token); // Decode the token to get user_id
    
    const userId = decodedToken?.user_id || null; // Ensure user_id is extracted properly
    
    if (inputValue.trim() !== '' && userId) {
      axios.post('http://localhost:8000/list/', {
        item_name: inputValue,
        item_status: 'Pending',
        user_id: userId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.data && response.data.item_name && response.data.item_status && response.data.item_id) {
          setItems([...items, { text: response.data.item_name, status: response.data.item_status, itemId: response.data.item_id }]);
          setInputValue(''); // Clear the input
        } else {
          console.error("Invalid response structure:", response.data);
        }
      })
      .catch(error => {
        console.error("Error creating the item:", error);
      });
    } else {
      console.warn("Input value is empty or user ID is invalid.");
    }
  };
  
  
  

  const handleDone = (index) => {
    const item = items[index];
    const token = localStorage.getItem('token'); // JWT token alınıyor
    const decodedToken = jwt_decode(token); // Token çözülüyor
    const userId = decodedToken?.user_id || null; // user_id çıkarılıyor
  
    axios.put(`http://localhost:8000/list/${item.itemId}`, {
      item_name: item.text,
      item_status: 'Done',
      user_id: userId  // user_id'yi backend'e gönderiyoruz
    }, {
      headers: {
        Authorization: `Bearer ${token}`  // Backend'e JWT token ile doğrulama yapılıyor
      }
    })
    .then(response => {
      const newItems = [...items];
      newItems[index].status = 'Done';
      setItems(newItems);
    })
    .catch(error => {
      console.error("There was an error updating the item!", error);
    });
  };
  
  const handleSaveEdit = (index) => {
    const item = items[index];
    const token = localStorage.getItem('token'); // JWT token alınıyor
    const decodedToken = jwt_decode(token); // Token çözülüyor
    const userId = decodedToken?.user_id || null; // user_id çıkarılıyor
  
    axios.put(`http://localhost:8000/list/${item.itemId}`, {
      item_name: editText,
      item_status: 'Pending',
      user_id: userId // user_id'yi backend'e gönderiyoruz
    }, {
      headers: {
        Authorization: `Bearer ${token}`  // Backend'e JWT token ile doğrulama yapılıyor
      }
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
      console.error("There was an error updating the item!", error);
    });
  };
  

  const handleDelete = (index) => {
    const item = items[index];
    axios.delete(`http://localhost:8000/list/${item.itemId}`)
    .then(() => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    })
    .catch(error => {
      console.error("There was an error deleting the item!", error);
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
                      className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                      onClick={() => handleSaveEdit(index)}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        onClick={() => handleUpdateStatus(index)}
                      >
                        Update
                      </button>
                      <button
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        onClick={() => handleDone(index)}
                      >
                        Done
                      </button>
                      <button
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={() => handleDelete(index)}
                      >
                        Delete
                      </button>
                    </>
                  )}
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
