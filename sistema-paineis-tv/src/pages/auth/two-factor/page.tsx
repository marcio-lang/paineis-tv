
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/base/Button';

export default function TwoFactorPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus no primeiro input
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Move para o próximo input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit quando todos os campos estão preenchidos
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    
    if (newCode.every(digit => digit !== '')) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleSubmit = async (codeToSubmit?: string) => {
    const finalCode = codeToSubmit || code.join('');
    
    if (finalCode.length !== 6) {
      setError('Digite o código completo de 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Simular verificação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (finalCode === '123456') {
        console.log('2FA verificado com sucesso');
        // Redirect para dashboard
      } else {
        setError('Código inválido. Tente novamente.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('Erro ao verificar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCanResend(false);
    setCountdown(30);
    setError('');
    
    try {
      // Simular reenvio
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Código reenviado');
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <i className="ri-shield-check-line text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verificação em duas etapas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Digite o código de 6 dígitos enviado para seu dispositivo
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="space-y-6">
            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                Código de verificação
              </label>
              <div className="flex justify-center space-x-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                ))}
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
                  {error}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => handleSubmit()}
              className="w-full"
              disabled={isLoading || code.some(digit => digit === '')}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Verificando...
                </>
              ) : (
                <>
                  <i className="ri-check-line mr-2"></i>
                  Verificar código
                </>
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Não recebeu o código?
              </p>
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={!canResend}
                className="text-sm"
              >
                {canResend ? (
                  <>
                    <i className="ri-refresh-line mr-2"></i>
                    Reenviar código
                  </>
                ) : (
                  <>
                    <i className="ri-time-line mr-2"></i>
                    Reenviar em {countdown}s
                  </>
                )}
              </Button>
            </div>

            {/* Help */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="ri-information-line text-blue-600 dark:text-blue-400 mt-0.5"></i>
                <div className="text-sm">
                  <p className="text-blue-800 dark:text-blue-300 font-medium mb-1">
                    Problemas para receber o código?
                  </p>
                  <ul className="text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Verifique se seu dispositivo está conectado</li>
                    <li>• Certifique-se de que o app autenticador está atualizado</li>
                    <li>• Tente sincronizar o horário do dispositivo</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Login */}
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

        {/* Alternative Methods */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Métodos alternativos
          </p>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              <i className="ri-smartphone-line mr-2"></i>
              Usar código de backup
            </Button>
            <Button variant="ghost" size="sm" className="w-full">
              <i className="ri-customer-service-line mr-2"></i>
              Entrar em contato com suporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
