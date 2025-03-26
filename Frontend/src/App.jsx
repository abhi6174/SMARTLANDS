// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UserPage from './pages/UserPage';
import SignUpPage from './pages/SignUpPage';
import AdminPage from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/register" element={<SignUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;