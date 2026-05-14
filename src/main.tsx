import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Bundled fonts — keeps the app fully offline (no Google CDN call at runtime).
// Variable woff2s ship every weight + style in one file, ~30KB per family.
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/source-serif-4';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
