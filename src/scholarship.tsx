import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ScholarshipPage from './ScholarshipPage';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScholarshipPage />
  </StrictMode>,
);
