
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/base/Button';
import { Input } from '../../../components/base/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

type QrStatus = 'idle' | 'pending' | 'approved' | 'expired' | 'error';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isQrMode, setIsQrMode] = useState(false);
  const [qrSessionId, setQrSessionId] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<QrStatus>('idle');
  const [isQrInitializing, setIsQrInitializing] = useState(false);
  const { login, loginWithToken, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [pollIntervalId, setPollIntervalId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit chamado!');
    e.preventDefault();
    console.log('preventDefault executado');
    setIsLoading(true);
    clearError();
    
    try {
      console.log('Iniciando login...');
      await login({
        email: formData.email,
        password: formData.password
      });
      
      console.log('Login bem-sucedido, redirecionando...');
      toast.success('Login realizado com sucesso!');
      
      // Aguardar um pouco para garantir que o estado foi atualizado
      setTimeout(() => {
        navigate('/');
      }, 100);
      
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startQrLogin = async () => {
    setIsQrInitializing(true);
    setQrStatus('idle');
    try {
      const data = await authService.initQrLogin();
      setQrSessionId(data.session_id);
      setQrExpiresAt(data.expires_at);
      setQrStatus('pending');
      toast.success('QR Code gerado. Escaneie com um dispositivo autenticado.');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao iniciar login por QR Code';
      setQrStatus('error');
      toast.error(errorMessage);
    } finally {
      setIsQrInitializing(false);
    }
  };

  const stopQrPolling = () => {
    if (pollIntervalId !== null) {
      window.clearInterval(pollIntervalId);
      setPollIntervalId(null);
    }
  };

  useEffect(() => {
    if (qrStatus !== 'pending' || !qrSessionId) {
      stopQrPolling();
      return;
    }

    if (pollIntervalId !== null) {
      return;
    }

    const id = window.setInterval(async () => {
      try {
        const statusData = await authService.getQrLoginStatus(qrSessionId);
        if (statusData.status === 'approved' && statusData.user && statusData.token) {
          stopQrPolling();
          loginWithToken(statusData.user, statusData.token);
          setQrStatus('approved');
          toast.success('Login por QR Code realizado com sucesso!');
          setTimeout(() => {
            navigate('/');
          }, 100);
        } else if (statusData.status === 'expired') {
          stopQrPolling();
          setQrStatus('expired');
          toast.error('QR Code expirado. Gere um novo para tentar novamente.');
        }
      } catch (error) {
        stopQrPolling();
        setQrStatus('error');
        toast.error('Erro ao verificar status do QR Code');
      }
    }, 2500);

    setPollIntervalId(id);

    return () => {
      window.clearInterval(id);
    };
  }, [qrStatus, qrSessionId, loginWithToken, navigate, pollIntervalId]);

  useEffect(() => {
    if (!isQrMode) {
      stopQrPolling();
      setQrSessionId(null);
      setQrExpiresAt(null);
      setQrStatus('idle');
    } else if (!qrSessionId && !isQrInitializing) {
      startQrLogin();
    }
  }, [isQrMode]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white" style={{ fontFamily: '"Pacifico", serif' }}>P</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Entre na sua conta para continuar
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 flex space-x-2">
              <Button
                type="button"
                variant={isQrMode ? 'outline' : 'default'}
                className="flex-1"
                onClick={() => setIsQrMode(false)}
              >
                <i className="ri-shield-user-line mr-2" />
                Login com senha
              </Button>
              <Button
                type="button"
                variant={isQrMode ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setIsQrMode(true)}
              >
                <i className="ri-qr-code-line mr-2" />
                Login com QR Code
              </Button>
            </div>
          </div>

          {!isQrMode && (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
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
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@paineltv.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-gray-400"></i>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 hover:text-gray-600`}></i>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Lembrar de mim
                </span>
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Entrando...
                </>
              ) : (
                <>
                  <i className="ri-login-box-line mr-2"></i>
                  Entrar
                </>
              )}
            </Button>
          </form>
          )}

          {isQrMode && (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="mb-4 text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Escaneie este QR Code com um dispositivo já autenticado
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use a câmera do celular; será aberta uma página para aprovar o login.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-md">
                  {qrSessionId ? (
                    <QRCode
                      value={`${window.location.origin}/auth/qr-approve?session_id=${qrSessionId}`}
                      size={180}
                    />
                  ) : (
                    <div className="w-[180px] h-[180px] flex items-center justify-center text-gray-400">
                      <i className="ri-loader-4-line animate-spin text-3xl" />
                    </div>
                  )}
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {qrStatus === 'pending' && qrExpiresAt && (
                    <span>Este QR Code expira em poucos minutos.</span>
                  )}
                  {qrStatus === 'expired' && (
                    <span className="text-red-500">QR Code expirado. Clique abaixo para gerar outro.</span>
                  )}
                  {qrStatus === 'approved' && (
                    <span className="text-green-500">Login aprovado. Redirecionando...</span>
                  )}
                  {qrStatus === 'error' && (
                    <span className="text-red-500">Ocorreu um erro ao validar o QR Code.</span>
                  )}
                </div>
              </div>

              <Button
                type="button"
                className="w-full"
                disabled={isQrInitializing}
                onClick={startQrLogin}
              >
                {isQrInitializing ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <i className="ri-refresh-line mr-2" />
                    Gerar novo QR Code
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
              <Link
                to="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
