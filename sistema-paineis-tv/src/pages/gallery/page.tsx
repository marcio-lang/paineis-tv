import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Função para detectar a URL base dinâmica
const getApiUrl = () => {
  const currentHost = window.location.hostname;
  const currentProtocol = window.location.protocol;
  
  // Se estiver acessando via localhost, usar localhost
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Se estiver acessando via IP da rede, usar o mesmo IP
  return `${currentProtocol}//${currentHost}:5000`;
};

const API_URL = '';

interface ActionImage {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  url: string;
}

interface Action {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  images: ActionImage[];
}

const GalleryPage: React.FC = () => {
  const { actionId } = useParams<{ actionId: string }>();
  const [action, setAction] = useState<Action | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAction = async () => {
      try {
        const response = await axios.get(`/api/actions/${actionId}`);
        setAction(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar ação:', error);
        setError('Erro ao carregar a galeria');
        setLoading(false);
      }
    };

    if (actionId) {
      fetchAction();
    }
  }, [actionId]);

  const nextImage = () => {
    if (action && action.images) {
      setCurrentImageIndex((prev) => (prev + 1) % action.images.length);
    }
  };

  const prevImage = () => {
    if (action && action.images) {
      setCurrentImageIndex((prev) => (prev - 1 + action.images.length) % action.images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        nextImage();
      } else if (event.key === 'ArrowLeft') {
        prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [action]);

  // Navegação por swipe em dispositivos móveis
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const diffX = startX - endX;
      const diffY = startY - endY;

      // Verificar se é um swipe horizontal (não vertical)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe para esquerda - próxima imagem
          nextImage();
        } else {
          // Swipe para direita - imagem anterior
          prevImage();
        }
      }

      startX = 0;
      startY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [action]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando galeria...</div>
      </div>
    );
  }

  if (error || !action) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || 'Ação não encontrada'}</div>
      </div>
    );
  }

  if (!action.images || action.images.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Nenhuma imagem encontrada nesta ação</div>
      </div>
    );
  }

  const currentImage = action.images[currentImageIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{action.name}</h1>
            <p className="text-gray-400 text-sm md:text-base">
              Imagem {currentImageIndex + 1} de {action.images.length}
            </p>
          </div>
          <button
            onClick={() => window.close()}
            className="bg-red-600 hover:bg-red-700 px-3 py-2 md:px-4 md:py-2 rounded transition-colors text-sm md:text-base"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Imagem principal */}
      <div className="flex-1 flex items-center justify-center p-2 md:p-4">
        <div className="relative max-w-4xl w-full">
          <img
            src={`${API_URL}${currentImage.url}`}
            alt={currentImage.filename}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg"
          />
          
          {/* Botões de navegação */}
          {action.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 md:p-3 rounded-full transition-all"
              >
                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 md:p-3 rounded-full transition-all"
              >
                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {action.images.length > 1 && (
        <div className="bg-gray-800 p-2 md:p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex space-x-1 md:space-x-2 overflow-x-auto pb-2">
              {action.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-blue-500 opacity-100'
                      : 'border-gray-600 opacity-60 hover:opacity-80'
                  }`}
                >
                  <img
                    src={`${API_URL}${image.url}`}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Informações da imagem */}
      <div className="bg-gray-800 p-2 md:p-4 border-t border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-xs md:text-sm text-gray-400 space-y-2 md:space-y-0">
            <span>Arquivo: {currentImage.filename}</span>
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-1 md:space-y-0">
              <span className="hidden md:inline">Use as setas do teclado para navegar</span>
              <span className="md:hidden">Deslize para navegar</span>
              <span className="hidden md:inline">ESC para sair</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
