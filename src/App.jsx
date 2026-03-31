// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { StarProvider } from './context/StarContext'; // ← NEW

function App() {
  return (
    <StarProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StarProvider>
  );
}

export default App;