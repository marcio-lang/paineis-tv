
import type { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/base/LoadingSpinner';

// Componente de loading para lazy loading
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

// Lazy loading das páginas principais
const HomePage = lazy(() => import('../pages/home/page'));
const PaineisPage = lazy(() => import('../pages/paineis/page'));
const AcoesPage = lazy(() => import('../pages/acoes/page'));
const UsuariosPage = lazy(() => import('../pages/usuarios/page'));
const AcougueAdminPage = lazy(() => import('../pages/acougue-admin/page'));
const DepartamentosPage = lazy(() => import('../pages/departamentos/page'));
const ProfilePage = lazy(() => import('../pages/profile/page'));
const SettingsPage = lazy(() => import('../pages/settings/page'));

// Páginas críticas carregadas normalmente (auth e TV)
import AcougueTVPage from '../pages/acougue-tv/page';
import PlayerTVPage from '../pages/player-tv/page';
import GalleryPage from '../pages/gallery/page';
import DepartmentPanelViewPage from '../pages/department-panel-view/page';
import { TVPanelPage } from '../pages/tv/TVPanelPage';
import LoginPage from '../pages/auth/login/page';
import RegisterPage from '../pages/auth/register/page';
import QrApprovePage from '../pages/auth/qr-approve/page';
import ForgotPasswordPage from '../pages/auth/forgot-password/page';
import ResetPasswordPage from '../pages/auth/reset-password/page';
import TwoFactorPage from '../pages/auth/two-factor/page';
import VerifyEmailPage from '../pages/auth/verify-email/page';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const routes: RouteObject[] = [
  // Rotas Públicas
  {
    path: '/auth/login',
    element: <LoginPage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/auth/qr-approve',
    element: <QrApprovePage />
  },
  {
    path: '/auth/register',
    element: <RegisterPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/auth/reset-password',
    element: <ResetPasswordPage />
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />
  },
  {
    path: '/auth/two-factor',
    element: <TwoFactorPage />
  },
  {
    path: '/two-factor',
    element: <TwoFactorPage />
  },
  {
    path: '/auth/verify-email',
    element: <VerifyEmailPage />
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />
  },
  {
    path: '/player/:panelId',
    element: <PlayerTVPage />
  },
  {
    path: '/p/:fixedUrl',
    element: <PlayerTVPage />
  },
  {
    path: '/acougue-tv',
    element: <AcougueTVPage />
  },
  {
    path: '/galeria/:actionId',
    element: <GalleryPage />
  },
  {
    path: '/departments/:departmentId/panels/:panelId/view',
    element: <DepartmentPanelViewPage />
  },
  {
    path: '/tv/:departmentId/:panelId',
    element: <TVPanelPage />
  },
  
  // Rotas Protegidas
  {
    path: '/',
    element: <ProtectedRoute><LazyWrapper><HomePage /></LazyWrapper></ProtectedRoute>
  },
  {
    path: '/paineis',
    element: <ProtectedRoute><LazyWrapper><PaineisPage /></LazyWrapper></ProtectedRoute>
  },
  {
    path: '/acoes',
    element: <ProtectedRoute><LazyWrapper><AcoesPage /></LazyWrapper></ProtectedRoute>
  },
  {
    path: '/usuarios',
    element: <ProtectedRoute><LazyWrapper><UsuariosPage /></LazyWrapper></ProtectedRoute>
  },
  {
    path: '/acougue-admin',
    element: <ProtectedRoute><LazyWrapper><AcougueAdminPage /></LazyWrapper></ProtectedRoute>
  },
  {
    path: '/departamentos',
    element: <ProtectedRoute><LazyWrapper><DepartamentosPage /></LazyWrapper></ProtectedRoute>
  },
  {
    path: '/profile',
    element: <ProtectedRoute><LazyWrapper><ProfilePage /></LazyWrapper></ProtectedRoute>
  },
  {
    path: '/settings',
    element: <ProtectedRoute><LazyWrapper><SettingsPage /></LazyWrapper></ProtectedRoute>
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;
