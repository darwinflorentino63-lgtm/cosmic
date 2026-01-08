import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Fix: Initialize the React application.
 * The previous content was incorrectly implementing a Vue-based application ("CosmicScribe")
 * which is incompatible with the React components used in the rest of this project.
 */
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
