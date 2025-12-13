
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/base/Button';
import { Input } from '../../../components/base/Input';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    // Validar token
    if (!token) {
      setIsValidToken(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      console.log('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 8) {
      console.log('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular redefinição de senha
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Muito fraca', 'Fraca', 'Regular', 'Forte', 'Muito forte'];

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-4">
              <i className="ri-error-warning-line text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Link inválido
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Este link de redefinição é inválido ou expirou
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-close-circle-line text-3xl text-red-600 dark:text-red-400"></i>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                O link pode ter expirado ou já foi usado. Solicite um novo link para redefinir sua senha.
              </p>
            </div>

            <div className="space-y-3">
              <Link to="/auth/forgot-password">
                <Button className="w-full">
                  <i className="ri-mail-send-line mr-2"></i>
                  Solicitar novo link
                </Button>
              </Link>
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4">
              <i className="ri-check-line text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Senha redefinida!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sua senha foi alterada com sucesso
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-3xl text-green-600 dark:text-green-400"></i>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Agora você pode fazer login com sua nova senha.
              </p>
            </div>

            <Link to="/auth/login">
              <Button className="w-full">
                <i className="ri-login-box-line mr-2"></i>
                Fazer login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl mb-4">
            <i className="ri-key-line text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Redefinir senha
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Digite sua nova senha
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-gray-400"></i>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Digite sua nova senha"
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
              
              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Força da senha: {strengthLabels[passwordStrength - 1] || 'Muito fraca'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-gray-400"></i>
                </div>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 hover:text-gray-600`}></i>
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  As senhas não coincidem
                </p>
              )}
            </div>

            {/* Requirements */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Requisitos da senha:
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <i className={`${formData.password.length >= 8 ? 'ri-check-line' : 'ri-close-line'} mr-2`}></i>
                  Pelo menos 8 caracteres
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <i className={`${/[A-Z]/.test(formData.password) ? 'ri-check-line' : 'ri-close-line'} mr-2`}></i>
                  Uma letra maiúscula
                </li>
                <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <i className={`${/[0-9]/.test(formData.password) ? 'ri-check-line' : 'ri-close-line'} mr-2`}></i>
                  Um número
                </li>
                <li className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  <i className={`${/[^A-Za-z0-9]/.test(formData.password) ? 'ri-check-line' : 'ri-close-line'} mr-2`}></i>
                  Um caractere especial
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || formData.password !== formData.confirmPassword || passwordStrength < 3}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Redefinindo...
                </>
              ) : (
                <>
                  <i className="ri-save-line mr-2"></i>
                  Redefinir senha
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
