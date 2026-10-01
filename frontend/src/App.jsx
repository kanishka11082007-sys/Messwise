import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HubLanding from './pages/HubLanding';
import LoginPage from './pages/LoginPage';
import StudentPortal from './pages/StudentPortal';
import AdminPortal from './pages/AdminPortal';
import NgoPortal from './pages/NgoPortal';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HubLanding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/student" element={<StudentPortal />} />
      <Route path="/admin" element={<AdminPortal />} />
      <Route path="/ngo" element={<NgoPortal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
