
import { BrowserRouter } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';
import routes from './router/config';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ColorProvider } from './contexts/ColorContext';
import { ToastProvider } from './components/ui/Toast';
import './i18n';

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <ThemeProvider>
        <ColorProvider>
          <AuthProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthProvider>
        </ColorProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
