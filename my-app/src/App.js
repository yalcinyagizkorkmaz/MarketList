import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GirisSayfa from './Component/GirisSayfa';
import ListSayfa from './Component/ListSayfa';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GirisSayfa />} /> {/* Varsayılan rota */}
        <Route path="/GirisSayfası" element={<GirisSayfa />} />
        <Route path="/List" element={<ListSayfa />} />
      </Routes>
    </Router>
  );
}

export default App;
