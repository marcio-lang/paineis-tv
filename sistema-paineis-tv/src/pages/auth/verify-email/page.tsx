
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/base/Button';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isError, setIsError] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const token = searchParams.get('token');
  const email = searchParams.get('email') || 'seu@email.com';

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsError(true);
        setIsLoading(false);
        return;
      }

      try {
        // Simular verificação
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsVerified(true);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResendEmail = async () => {
    setCanResend(false);
    setCountdown(60);
    
    try {
      // Simular reenvio
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Email reenviado');
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-loader-4-line text-3xl text-blue-600 dark:text-blue-400 animate-spin"></i>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Verificando email...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Aguarde enquanto verificamos seu email
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4">
              <i className="ri-check-line text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email verificado!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sua conta foi ativada com sucesso
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-3xl text-green-600 dark:text-green-400"></i>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Bem-vindo!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Seu email foi verificado e sua conta está ativa. Agora você pode fazer login e começar a usar nossa plataforma.
              </p>
            </div>

            <div className="space-y-3">
              <Link to="/auth/login">
                <Button className="w-full">
                  <i className="ri-login-box-line mr-2"></i>
                  Fazer login
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <i className="ri-home-line mr-2"></i>
                  Ir para início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-4">
              <i className="ri-error-warning-line text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Erro na verificação
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Não foi possível verificar seu email
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-close-circle-line text-3xl text-red-600 dark:text-red-400"></i>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Link inválido ou expirado
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                O link de verificação pode ter expirado ou já foi usado. Você pode solicitar um novo email de verificação.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                {email}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={!canResend}
                className="w-full"
              >
                {canResend ? (
                  <>
                    <i className="ri-mail-send-line mr-2"></i>
                    Reenviar email
                  </>
                ) : (
                  <>
                    <i className="ri-time-line mr-2"></i>
                    Reenviar em {countdown}s
                  </>
                )}
              </Button>
              
              <Link to="/auth/login">
                <Button variant="outline" className="w-full">
                  <i className="ri-arrow-left-line mr-2"></i>
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
