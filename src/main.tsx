import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/tailwind.css';
import { ApiProvider } from './state/ApiProvider';
import { UserConfigProvider } from './state/UserConfigContext';
import { restoreSpaRouteFromGithubPages } from './utils/githubPagesRedirect';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});

restoreSpaRouteFromGithubPages();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiProvider>
        <UserConfigProvider>
          <App />
        </UserConfigProvider>
      </ApiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
