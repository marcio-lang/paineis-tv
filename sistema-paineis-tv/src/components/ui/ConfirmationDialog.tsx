import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, Trash2, Save, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../base/Button';
import { useToast } from './Toast';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  requireConfirmation?: boolean;
  confirmationText?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  requireConfirmation = false,
  confirmationText = 'CONFIRMAR'
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const handleConfirm = async () => {
    if (requireConfirmation && confirmationInput !== confirmationText) {
      showToast('Digite a confirmação corretamente', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      await onConfirm();
      onClose();
      setConfirmationInput('');
    } catch (error) {
      console.error('Confirmation error:', error);
      showToast('Erro ao executar ação', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !loading) {
      onClose();
      setConfirmationInput('');
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle className="w-12 h-12 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'info':
        return <Info className="w-12 h-12 text-blue-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
    }
  };

  const getButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger';
      case 'success':
        return 'primary';
      case 'info':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const isConfirmDisabled = requireConfirmation && confirmationInput !== confirmationText;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      closeOnEscape={!isProcessing && !loading}
      closeOnOverlayClick={!isProcessing && !loading}
    >
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          {getIcon()}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Confirmation Input */}
        {requireConfirmation && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Para confirmar, digite <strong>{confirmationText}</strong> abaixo:
            </p>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={confirmationText}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200"
              disabled={isProcessing || loading}
              autoComplete="off"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing || loading}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            {cancelText}
          </Button>
          
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            loading={isProcessing || loading}
            disabled={isConfirmDisabled}
            className="flex-1"
          >
            {type === 'danger' ? (
              <Trash2 className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Hook for easier usage
export const useConfirmation = () => {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    requireConfirmation?: boolean;
    confirmationText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  const confirm = (options: {
    title: string;
    message: string;
    type?: 'warning' | 'danger' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    requireConfirmation?: boolean;
    confirmationText?: string;
    onConfirm: () => void | Promise<void>;
  }) => {
    setDialog({
      isOpen: true,
      type: 'warning',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      requireConfirmation: false,
      confirmationText: 'CONFIRMAR',
      ...options
    });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const ConfirmationComponent = () => (
    <ConfirmationDialog
      isOpen={dialog.isOpen}
      onClose={closeDialog}
      onConfirm={dialog.onConfirm}
      title={dialog.title}
      message={dialog.message}
      type={dialog.type}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
      requireConfirmation={dialog.requireConfirmation}
      confirmationText={dialog.confirmationText}
    />
  );

  return {
    confirm,
    ConfirmationComponent
  };
};

// Predefined confirmation dialogs
export const confirmations = {
  delete: (itemName: string, onConfirm: () => void | Promise<void>) => ({
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
    type: 'danger' as const,
    confirmText: 'Excluir',
    requireConfirmation: true,
    onConfirm
  }),

  save: (onConfirm: () => void | Promise<void>) => ({
    title: 'Salvar Alterações',
    message: 'Deseja salvar as alterações realizadas?',
    type: 'info' as const,
    confirmText: 'Salvar',
    onConfirm
  }),

  discard: (onConfirm: () => void | Promise<void>) => ({
    title: 'Descartar Alterações',
    message: 'Tem certeza que deseja descartar todas as alterações não salvas?',
    type: 'warning' as const,
    confirmText: 'Descartar',
    onConfirm
  }),

  logout: (onConfirm: () => void | Promise<void>) => ({
    title: 'Sair do Sistema',
    message: 'Tem certeza que deseja sair do sistema?',
    type: 'info' as const,
    confirmText: 'Sair',
    onConfirm
  }),

  activate: (itemName: string, onConfirm: () => void | Promise<void>) => ({
    title: 'Ativar Item',
    message: `Deseja ativar "${itemName}"?`,
    type: 'success' as const,
    confirmText: 'Ativar',
    onConfirm
  }),

  deactivate: (itemName: string, onConfirm: () => void | Promise<void>) => ({
    title: 'Desativar Item',
    message: `Deseja desativar "${itemName}"?`,
    type: 'warning' as const,
    confirmText: 'Desativar',
    onConfirm
  })
};