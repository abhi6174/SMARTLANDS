// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UserPage from './pages/UserPage';
import SignUpPage from './pages/SignUpPage'; // New import
import { LandProvider } from './context/LandContext';

function App() {
  return (
    <LandProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/register" element={<SignUpPage />} /> {/* New route */}
        </Routes>
      </Router>
    </LandProvider>
  );
}

export default App;