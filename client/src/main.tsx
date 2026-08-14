import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App/App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('root element not found: index.html is missing #root');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
