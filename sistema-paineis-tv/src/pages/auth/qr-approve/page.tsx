import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authService } from '../../../services/authService';
import { AuthLayout } from '../../../components/layout/Layout';
import { Button } from '../../../components/base/Button';
import { toast } from 'sonner';

export default function QrApprovePage() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const getSessionId = () => {
    const params = new URLSearchParams(location.search);
    return params.get('session_id') || '';
  };

  const handleApprove = async () => {
    const sessionId = getSessionId();
    if (!sessionId) {
      setStatus('error');
      setMessage('Sessão inválida para aprovação');
      toast.error('Sessão inválida para aprovação');
      return;
    }

    setIsLoading(true);
    try {
      await authService.approveQrLogin(sessionId);
      setStatus('success');
      setMessage('Login autorizado com sucesso. Você já pode voltar ao outro dispositivo.');
      toast.success('Login autorizado com sucesso');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao autorizar login';
      setStatus('error');
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const sessionId = getSessionId();
    if (!sessionId) {
      setStatus('error');
      setMessage('Sessão inválida para aprovação');
    }
  }, [location.search]);

  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              <i className="ri-qr-code-line text-2xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Aprovar login por QR Code
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Confirme para autorizar o login em outro dispositivo usando sua conta atual.
            </p>
          </div>

          <div className="space-y-4">
            {status !== 'idle' && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  status === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                }`}
              >
                {message}
              </div>
            )}

            <Button
              onClick={handleApprove}
              className="w-full"
              disabled={isLoading || status === 'success'}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2" />
                  Autorizando...
                </>
              ) : (
                <>
                  <i className="ri-shield-check-line mr-2" />
                  Autorizar login neste momento
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Certifique-se de que você reconhece o dispositivo que exibiu este QR Code antes de autorizar.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

