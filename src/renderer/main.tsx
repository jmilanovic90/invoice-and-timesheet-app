import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/tokens.css';
import './styles/global.css';

type AppConfig = {
  __APP_API_BASE_URL__?: string;
};

(globalThis as typeof globalThis & AppConfig).__APP_API_BASE_URL__ = import.meta.env.VITE_API_BASE_URL;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
