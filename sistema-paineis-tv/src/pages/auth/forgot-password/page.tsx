
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/base/Button';
import { Input } from '../../../components/base/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsEmailSent(true);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4">
              <i className="ri-mail-check-line text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email enviado!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Verifique sua caixa de entrada
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-mail-send-line text-3xl text-green-600 dark:text-green-400"></i>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Instruções enviadas
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Enviamos um link para redefinir sua senha para:
              </p>
              <p className="font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                {email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-2">Não recebeu o email?</p>
                <ul className="text-left space-y-1">
                  <li>• Verifique sua pasta de spam</li>
                  <li>• Aguarde alguns minutos</li>
                  <li>• Verifique se o email está correto</li>
                </ul>
              </div>

              <Button
                onClick={() => setIsEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Tentar novamente
              </Button>

              <Link to="/auth/login">
                <Button variant="ghost" className="w-full">
                  <i className="ri-login-box-line mr-2"></i>
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-4">
            <i className="ri-lock-unlock-line text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Esqueceu sua senha?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Digite seu email para receber instruções
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-mail-line text-gray-400"></i>
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="ri-mail-send-line mr-2"></i>
                  Enviar instruções
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 flex items-center justify-center"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Voltar ao login
            </Link>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Precisa de ajuda?{' '}
            <Link to="/support" className="text-purple-600 hover:text-purple-500 dark:text-purple-400">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
