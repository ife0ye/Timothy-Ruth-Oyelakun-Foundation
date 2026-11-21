import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

export function mount(page: ReactNode): void {
  createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>);
}
