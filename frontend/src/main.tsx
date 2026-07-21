import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store, RootState } from './store/store';
import { AppWithLayout } from './AppWithLayout';
import { createCustomTheme } from './utils/themeProvider';

import './index.css';

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeWrapper>
        <AppWithLayout />
      </ThemeWrapper>
    </Provider>
  </React.StrictMode>
);
