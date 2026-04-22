import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Optional: clean old service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister())
  })
}

const rootElement = document.getElementById('root');

if (!window._reactRoot) {
  window._reactRoot = ReactDOM.createRoot(rootElement);
}

// Ensure no ghost DOM nodes remain from previous HMR renders
rootElement.innerHTML = '';

window._reactRoot.render(
  <App />
);