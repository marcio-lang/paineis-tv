import { ReactNode } from 'react';
import { Header } from './Header';
import { AnimatedPage } from '../ui/AnimatedPage';
import { Toaster } from 'sonner';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade' | 'slide-up' | 'slide-right' | 'scale';
  showHeader?: boolean;
}

export function Layout({ 
  children, 
  className = '', 
  animation = 'fade',
  showHeader = true 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {showHeader && <Header />}
      
      <main className={`
        ${showHeader ? 'pt-0' : ''} 
        ${className}
      `}>
        <AnimatedPage animation={animation}>
          {children}
        </AnimatedPage>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}

// Layout específico para páginas com container
export function ContainerLayout({ 
  children, 
  className = '',
  maxWidth = '7xl',
  padding = true,
  animation = 'fade'
}: LayoutProps & { 
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  padding?: boolean;
}) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <Layout animation={animation} className={className}>
      <div className={`
        mx-auto ${maxWidthClasses[maxWidth]} 
        ${padding ? 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8' : ''}
      `}>
        {children}
      </div>
    </Layout>
  );
}

// Layout para páginas de autenticação (sem header)
export function AuthLayout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <AnimatedPage animation="fade">
        {children}
      </AnimatedPage>
      <Toaster position="top-right" richColors />
    </div>
  );
}

// Layout para páginas fullscreen (como TV do açougue)
export function FullscreenLayout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen w-full ${className}`}>
      <AnimatedPage animation="fade">
        {children}
      </AnimatedPage>
      <Toaster position="top-right" richColors />
    </div>
  );
}