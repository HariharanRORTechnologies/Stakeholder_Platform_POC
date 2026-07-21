import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store, RootState } from './store/store';
import { AppWithLayout } from './AppWithLayout';
import { createCustomTheme } from './utils/themeProvider';

import './index.css';

console.log('main.tsx: Starting app initialization...');

// Theme Provider Component
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const muiTheme = createCustomTheme(theme);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

try {
  console.log('main.tsx: Getting root element...');
  const rootElement = document.getElementById('root');
  console.log('main.tsx: Root element:', rootElement);

  if (!rootElement) {
    throw new Error('Root element not found!');
  }

  console.log('main.tsx: Creating React root...');
  const root = ReactDOM.createRoot(rootElement);

  console.log('main.tsx: Rendering app...');
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <ThemeWrapper>
          <AppWithLayout />
        </ThemeWrapper>
      </Provider>
    </React.StrictMode>
  );
  console.log('main.tsx: App rendered successfully!');
} catch (error) {
  console.error('main.tsx: Error during initialization:', error);
}
