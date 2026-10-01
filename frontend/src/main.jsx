import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { MesswiseProvider } from './context/MesswiseContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MesswiseProvider>
        <App />
      </MesswiseProvider>
    </BrowserRouter>
  </React.StrictMode>
);
