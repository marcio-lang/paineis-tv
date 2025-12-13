
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/base/Button';
import { Input } from '../../../components/base/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    
    // Validações
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      toast.error('Você deve aceitar os termos de uso');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no registro';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white" style={{ fontFamily: '"Pacifico", serif' }}>P</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Criar nova conta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Preencha os dados para começar
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-user-line text-gray-400"></i>
                </div>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="João Silva"
                  className="pl-10"
                  required
                />
              </div>
            </div>

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
                  placeholder="seu@email.com"
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
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-gray-400"></i>
                </div>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirme sua senha"
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

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                required
              />
              <div className="ml-3 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  Eu aceito os{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Política de Privacidade
                  </Link>
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !formData.acceptTerms}
            >
              {isLoading ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Criando conta...
                </>
              ) : (
                <>
                  <i className="ri-user-add-line mr-2"></i>
                  Criar conta
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Já tem uma conta?{' '}
              <Link
                to="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
