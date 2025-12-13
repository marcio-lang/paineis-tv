import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, Video, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../base/Button';
import { ProgressBar } from './ProgressBar';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  disabled?: boolean;
  className?: string;
  preview?: boolean;
  dragAndDrop?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  onFilesChange,
  onUpload,
  disabled = false,
  className = '',
  preview = true,
  dragAndDrop = true
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo: ${formatFileSize(maxSize)}`;
    }
    
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });
      
      if (!isAccepted) {
        return `Tipo de arquivo não aceito. Aceitos: ${accept}`;
      }
    }
    
    return null;
  };

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!preview || !file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      if (files.length + newFiles.length >= maxFiles) {
        break;
      }
      
      const error = validateFile(file);
      const preview = await createPreview(file);
      
      newFiles.push({
        file,
        id: generateId(),
        progress: 0,
        status: error ? 'error' : 'pending',
        error,
        preview
      });
    }
    
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    
    if (onFilesChange) {
      onFilesChange(updatedFiles.map(f => f.file));
    }
  }, [files, maxFiles, onFilesChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      processFiles(fileList);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && dragAndDrop) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled && dragAndDrop) {
      const fileList = e.dataTransfer.files;
      if (fileList) {
        processFiles(fileList);
      }
    }
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    
    if (onFilesChange) {
      onFilesChange(updatedFiles.map(f => f.file));
    }
  };

  const uploadFiles = async () => {
    if (!onUpload || isUploading) return;
    
    setIsUploading(true);
    const validFiles = files.filter(f => f.status === 'pending');
    
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        validFiles.find(vf => vf.id === f.id) 
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      ));

      // Simulate upload progress with smoother animation
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.status === 'uploading' && f.progress < 90) {
            return { ...f, progress: Math.min(f.progress + Math.random() * 15 + 5, 90) };
          }
          return f;
        }));
      }, 300);

      await onUpload(validFiles.map(f => f.file));
      
      clearInterval(progressInterval);
      
      // Mark as success with final progress
      setFiles(prev => prev.map(f => 
        validFiles.find(vf => vf.id === f.id)
          ? { ...f, status: 'success' as const, progress: 100 }
          : f
      ));
      
    } catch (error) {
      // Mark as error
      setFiles(prev => prev.map(f => 
        validFiles.find(vf => vf.id === f.id)
          ? { ...f, status: 'error' as const, error: 'Erro no upload' }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const hasValidFiles = files.some(f => f.status === 'pending');
  const hasErrors = files.some(f => f.status === 'error');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        
        <Upload className={`
          w-12 h-12 mx-auto mb-4 transition-colors duration-200
          ${isDragOver ? 'text-blue-500' : 'text-gray-400'}
        `} />
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {dragAndDrop ? 'Arraste arquivos aqui ou clique para selecionar' : 'Clique para selecionar arquivos'}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {accept && `Tipos aceitos: ${accept}`}
          {maxSize && ` • Tamanho máximo: ${formatFileSize(maxSize)}`}
          {multiple && ` • Máximo ${maxFiles} arquivos`}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Arquivos selecionados ({files.length})
          </h4>
          
          <div className="space-y-2">
            {files.map((uploadedFile) => {
              const Icon = getFileIcon(uploadedFile.file);
              
              return (
                <div
                  key={uploadedFile.id}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0 mr-3">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                    
                    {/* Progress Bar */}
                    {uploadedFile.status === 'uploading' && (
                      <div className="mt-2">
                        <ProgressBar
                          value={uploadedFile.progress}
                          size="sm"
                          animated
                        />
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {uploadedFile.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {uploadedFile.error}
                      </p>
                    )}
                  </div>
                  
                  {/* Status Icon */}
                  <div className="flex-shrink-0 ml-3">
                    {uploadedFile.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {uploadedFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {uploadedFile.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  {uploadedFile.status !== 'uploading' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(uploadedFile.id);
                      }}
                      className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      aria-label="Remover arquivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Upload Button */}
          {onUpload && hasValidFiles && (
            <div className="flex justify-end">
              <Button
                onClick={uploadFiles}
                disabled={isUploading || !hasValidFiles}
                loading={isUploading}
              >
                {isUploading ? 'Enviando...' : 'Enviar Arquivos'}
              </Button>
            </div>
          )}
          
          {/* Error Summary */}
          {hasErrors && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  Alguns arquivos contêm erros. Verifique os detalhes acima.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};