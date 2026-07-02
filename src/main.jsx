import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

// UI font: Plus Jakarta Sans (variable, self-hosted) — premium geometric sans, app-wide via fontFamily.sans
import '@fontsource-variable/plus-jakarta-sans';
// Data font: JetBrains Mono (variable) — codes, tokens, IDs (Tailwind font-mono)
import '@fontsource-variable/jetbrains-mono';
import './index.css';

import App from './App';
import ApiTokenBridge from './components/ApiTokenBridge';
import { queryClient } from './lib/queryClient';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to clinic-web/.env');
}

// Register the PWA service worker (installable, offline-aware).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/sign-in">
      <QueryClientProvider client={queryClient}>
        <ApiTokenBridge />
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster richColors closeButton position="top-right" />
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
);
