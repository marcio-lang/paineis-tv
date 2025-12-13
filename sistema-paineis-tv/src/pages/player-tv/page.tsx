import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';

// Interfaces TypeScript
interface ActionImage {
  id: string;
  filename: string;
  url: string;
}

interface Action {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  images: ActionImage[];
  has_border?: boolean;
}

interface Panel {
  id: string;
  name: string;
  layout_type: string;
  fixed_url?: string;
}

interface PanelData {
  panel: Panel;
  actions: Action[];
  active: boolean;
  message?: string;
}

const PlayerTVPage: React.FC = () => {
  const { panelId, fixedUrl } = useParams<{ panelId?: string; fixedUrl?: string }>();
  const [panelData, setPanelData] = useState<PanelData | null>(null);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [leftImageIndex, setLeftImageIndex] = useState(0);
  const [rightImageIndex, setRightImageIndex] = useState(1);
  const [validImages, setValidImages] = useState(new Set<number>());
  const [failedImages, setFailedImages] = useState(new Set<number>());
  const [isCheckingImages, setIsCheckingImages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [imageAspectById, setImageAspectById] = useState<Record<string, number>>({});

  // API URL configuration
  const API_URL = '';

  // Refs para persistir índices entre re-renders
  const leftIndexRef = useRef(0);
  const nextIndexRef = useRef(1);
  const initializedActionRef = useRef<string | null>(null);
  const lastSingleActionIdRef = useRef<string | null>(null);

  // Configurações do player
  const SHOW_PANEL_INFO = (import.meta.env.VITE_SHOW_PANEL_INFO || 'true') === 'true';
  const SHOW_DEBUG_INFO = (import.meta.env.VITE_SHOW_DEBUG_INFO || 'false') === 'true';
  const SHOW_PROGRESS = (import.meta.env.VITE_SHOW_PROGRESS || 'true') === 'true';

  // Transformações de imagem
  const IMAGE_ROTATION_DEG = Number(import.meta.env.VITE_IMAGE_ROTATION_DEG || '0');
  const IMAGE_FLIP_HORIZONTAL = (import.meta.env.VITE_IMAGE_FLIP_HORIZONTAL || 'false') === 'true';
  const IMAGE_FLIP_VERTICAL = (import.meta.env.VITE_IMAGE_FLIP_VERTICAL || 'false') === 'true';

  const mediaTransformStyle = {
    transform: `${IMAGE_ROTATION_DEG ? `rotate(${IMAGE_ROTATION_DEG}deg)` : ''}${IMAGE_FLIP_HORIZONTAL ? ' scaleX(-1)' : ''}${IMAGE_FLIP_VERTICAL ? ' scaleY(-1)' : ''}`.trim() || 'none',
  };

  // Intervalo de slides
  const SLIDE_INTERVAL_MS = Number(import.meta.env.VITE_SLIDE_INTERVAL_MS || '5000');

  // Handlers para carregamento de imagens
  const handleImageLoad = (imageIndex: number, filename: string) => {
    console.log(`Imagem carregada com sucesso: ${filename} (index: ${imageIndex})`);
    setValidImages(prev => new Set([...prev, imageIndex]));
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageIndex);
      return newSet;
    });
  };

  const handleImageError = (imageIndex: number, filename: string, url: string, position = '') => {
    console.error(`Erro ao carregar imagem ${position}: ${filename} (index: ${imageIndex})`);
    console.error(`URL da imagem com erro: ${url}`);
    
    setFailedImages(prev => new Set([...prev, imageIndex]));
    setValidImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageIndex);
      return newSet;
    });
    
    if (!isCheckingImages && panelData && panelData.actions && panelData.actions.length > 0) {
      const currentAction = panelData.actions[currentActionIndex];
      const layoutType = panelData.panel?.layout_type || 'layout_1';
      
      setIsCheckingImages(true);
      
      if (layoutType === 'layout_1') {
        setTimeout(() => {
          setCurrentImageIndex((prevIndex) => {
            let newIndex = (prevIndex + 1) % currentAction.images.length;
            let attempts = 0;
            
            while (failedImages.has(newIndex) && attempts < currentAction.images.length) {
              newIndex = (newIndex + 1) % currentAction.images.length;
              attempts++;
            }
            
            console.log(`Avançando automaticamente devido a erro: ${prevIndex} -> ${newIndex}`);
            return newIndex;
          });
          setIsCheckingImages(false);
        }, 500);
      }
    }
  };

  // Buscar dados do painel
  const fetchPanelData = useCallback(async () => {
    try {
      let endpoint: string;
      let identifier: string;
      
      if (fixedUrl) {
        endpoint = `/api/player/${fixedUrl}`;
        identifier = fixedUrl;
        setDebugInfo(`Buscando dados do painel por URL: ${fixedUrl}`);
      } else {
        endpoint = `/api/panels/${panelId}/play`;
        identifier = panelId || '';
        setDebugInfo(`Buscando dados do painel: ${panelId}`);
      }
      
      console.log('Fazendo requisição para:', endpoint);
      const response = await axios.get<PanelData>(endpoint);
      console.log('Resposta da API:', response.data);
      
      if (response.data.actions) {
        response.data.actions.forEach((action, index) => {
          console.log(`Ação ${index + 1} - ${action.name}:`, {
            start_date: action.start_date,
            end_date: action.end_date
          });
        });
      }

      if (!response.data.active) {
        setError(response.data.message || 'Painel não está ativo');
        setDebugInfo('Painel inativo');
      } else {
        setPanelData(response.data);
        setError(null);
        setDebugInfo(`Painel carregado: ${response.data.actions?.length || 0} ações`);
      }
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      console.error('Erro response:', error.response);

      let errorMessage = 'Erro ao carregar painel';
      if (error.response) {
        errorMessage = `Erro ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Erro de conexão - Verifique se o backend está rodando';
      }

      setError(errorMessage);
      setDebugInfo(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [API_URL, panelId, fixedUrl]);

  // Effect inicial para carregar dados
  useEffect(() => {
    console.log('Player iniciado para painel:', panelId || fixedUrl);
    console.log('API URL:', API_URL);
    fetchPanelData();
    const interval = setInterval(fetchPanelData, 60000);
    return () => clearInterval(interval);
  }, [fetchPanelData]);

  // Effect para gerenciar ações
  useEffect(() => {
    if (panelData && panelData.actions && panelData.actions.length > 0) {
      console.log(`=== CONFIGURAÇÃO DE AÇÕES ===`);
      console.log(`Total de ações disponíveis: ${panelData.actions.length}`);
      
      if (panelData.actions.length === 1) {
        console.log(`=== MODO AÇÃO ÚNICA ===`);
        console.log(`Apenas 1 ação cadastrada: ${panelData.actions[0]?.name}`);
        console.log(`Total de imagens na ação: ${panelData.actions[0]?.images?.length || 0}`);
        
        const singleActionId = panelData.actions[0]?.id;
        setCurrentActionIndex(0);
        if (lastSingleActionIdRef.current !== singleActionId) {
          setCurrentImageIndex(0);
          setLeftImageIndex(0);
          setRightImageIndex(1);
          leftIndexRef.current = 0;
          nextIndexRef.current = 1;
          lastSingleActionIdRef.current = singleActionId;
          initializedActionRef.current = singleActionId;
          console.log(`Reset de índices por troca de ação única (${singleActionId})`);
        } else {
          console.log(`Mantendo índices atuais - mesma ação única (${singleActionId})`);
        }
      }
      
      if (panelData.actions.length > 1) {
        console.log(`=== MODO MÚLTIPLAS AÇÕES ===`);
        console.log(`Sistema configurado para trocar entre ${panelData.actions.length} ações`);
        
        const interval = setInterval(() => {
          setCurrentActionIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % panelData.actions.length;
            const currentAction = panelData.actions[prevIndex];
            const nextAction = panelData.actions[nextIndex];
            
            console.log(`Mudando da ação ${prevIndex} (${currentAction?.name}) para ação ${nextIndex} (${nextAction?.name})`);
            
            setCurrentImageIndex(0);
            setLeftImageIndex(0);
            setRightImageIndex(1);
            return nextIndex;
          });
        }, SLIDE_INTERVAL_MS);
        return () => clearInterval(interval);
      }
    }
  }, [panelData, SLIDE_INTERVAL_MS]);

  // Effect para rotação de imagens
  useEffect(() => {
    console.log(`=== USEEFFECT DE ROTAÇÃO EXECUTADO ===`);
    
    if (panelData && panelData.actions && panelData.actions.length > 0) {
      const currentAction = panelData.actions[currentActionIndex];
      console.log(`=== ROTAÇÃO DE IMAGENS - AÇÃO: ${currentAction?.name} ===`);
      console.log(`Número de imagens na ação atual: ${currentAction?.images?.length || 0}`);
      
      if (currentAction && currentAction.images && currentAction.images.length > 1) {
        const layoutType = panelData.panel?.layout_type || 'layout_1';
        console.log(`Layout type: ${layoutType}`);
        
        if (layoutType === 'layout_2') {
          const total = currentAction.images.length;

          if (leftIndexRef.current >= total) leftIndexRef.current = 0;
          if (nextIndexRef.current >= total) nextIndexRef.current = (leftIndexRef.current + 1) % total;
          if (nextIndexRef.current === leftIndexRef.current) {
            nextIndexRef.current = (leftIndexRef.current + 1) % total;
          }

          const interval = setInterval(() => {
            const newRight = leftIndexRef.current;
            const newLeft = nextIndexRef.current;

            leftIndexRef.current = newLeft;
            nextIndexRef.current = (nextIndexRef.current + 1) % total;
            if (nextIndexRef.current === leftIndexRef.current) {
              nextIndexRef.current = (nextIndexRef.current + 1) % total;
            }

            setLeftImageIndex(newLeft);
            setRightImageIndex(newRight);
          }, SLIDE_INTERVAL_MS);

          return () => clearInterval(interval);
        } else {
          console.log(`Iniciando rotação para ${layoutType}`);
          
          const interval = setInterval(() => {
            console.log(`=== TIMER EXECUTADO - ${layoutType} ===`);
            
            setCurrentImageIndex((prevIndex) => {
              const newIndex = (prevIndex + 1) % currentAction.images.length;
              console.log(`${layoutType}: Mudando imagem de ${prevIndex} para ${newIndex}`);
              return newIndex;
            });
          }, SLIDE_INTERVAL_MS);
          
          return () => clearInterval(interval);
        }
      }
    }
  }, [panelData, currentActionIndex, SLIDE_INTERVAL_MS]);

  // Effect para inicializar layout_2
  useEffect(() => {
    if (panelData && panelData.actions && panelData.actions.length > 0) {
      const currentAction = panelData.actions[currentActionIndex];
      const layoutType = panelData.panel?.layout_type || 'layout_1';
      
      if (layoutType === 'layout_2' && currentAction && currentAction.images && currentAction.images.length > 0) {
        if (initializedActionRef.current !== currentAction.id) {
          const totalImages = currentAction.images.length;
          console.log(`=== INICIALIZANDO LAYOUT_2 PARA AÇÃO ${currentAction.id} ===`);

          setLeftImageIndex(0);
          setRightImageIndex(1);
          leftIndexRef.current = 0;
          nextIndexRef.current = totalImages > 1 ? 1 : 0;
          initializedActionRef.current = currentAction.id;
          console.log(`Layout_2 inicializado - Esquerda=0, Direita=1`);
        }
      }
    }
  }, [panelData, currentActionIndex]);

  // Função para formatar data brasileira
  const formatDateBrazil = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Tela de carregamento
  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl mb-4">⏳</div>
          <div className="text-white text-xl mb-2">Carregando painel...</div>
          <div className="text-white text-sm opacity-75">{debugInfo}</div>
          <div className="text-white text-xs opacity-50 mt-4">
            Painel: {panelId || fixedUrl}<br/>
            API: {API_URL}
          </div>
        </div>
      </div>
    );
  }

  // Tela de erro
  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <div className="text-white text-xl mb-4">{error}</div>
          <div className="text-white text-sm opacity-75">{debugInfo}</div>
          <div className="text-white text-xs opacity-50">
            Painel: {panelId || fixedUrl}<br/>
            API: {API_URL}<br/>
            Tentando reconectar em 60 segundos...
          </div>
          <button 
            onClick={fetchPanelData}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Verificar se há dados do painel
  if (!panelData) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-400 text-4xl mb-4">📋</div>
          <div className="text-white text-xl">Painel não encontrado</div>
          <div className="text-white text-xs opacity-50 mt-4">
            Painel: {panelId || fixedUrl}
          </div>
        </div>
      </div>
    );
  }

  // Verificar se há ações
  if (!panelData.actions || panelData.actions.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-400 text-4xl mb-4">📺</div>
          <div className="text-white text-xl mb-2">Nenhuma ação ativa disponível</div>
          <div className="text-white text-xs opacity-50 mt-4">
            Adicione ações com imagens no painel administrativo
          </div>
        </div>
      </div>
    );
  }

  const currentAction = panelData.actions[currentActionIndex];
  const layoutType = panelData.panel?.layout_type || 'layout_1';

  // Função para renderizar layouts
  const renderLayout = () => {
    if (!currentAction || !currentAction.images || currentAction.images.length === 0) {
      return (
        <div className="text-center text-white">
          <div className="text-4xl mb-4">📷</div>
          <div>Nenhuma imagem disponível nesta ação</div>
        </div>
      );
    }

    switch (layoutType) {
      case 'layout_1':
        // Carrossel - 1 imagem por vez
        const currentImage = currentAction.images[currentImageIndex % currentAction.images.length];
        const nextImage = currentAction.images[nextImageIndex % currentAction.images.length];
        
        return (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                {/* Imagem atual */}
                <div 
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-center justify-center ${
                    isTransitioning ? 'opacity-0 transform translate-x-[-100%]' : 'opacity-100 transform translate-x-0'
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={`${API_URL}${currentImage.url}`}
                      alt={currentImage.filename}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      style={mediaTransformStyle}
                      onLoad={() => handleImageLoad(currentImageIndex, currentImage.filename)}
                      onError={() => {
                        handleImageError(currentImageIndex, currentImage.filename, `${API_URL}${currentImage.url}`, 'carrossel');
                      }}
                    />
                  </div>
                </div>
                
                {/* Próxima imagem (durante transição) */}
                {isTransitioning && (
                  <div className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-100 transform translate-x-0 flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={`${API_URL}${nextImage.url}`}
                        alt={nextImage.filename}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        style={mediaTransformStyle}
                      />
                    </div>
                  </div>
                )}
                
                {/* Indicadores de posição */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {currentAction.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === (currentImageIndex % currentAction.images.length)
                          ? 'bg-white shadow-lg'
                          : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Controles de navegação */}
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-200"
                  onClick={() => {
                    if (!isTransitioning) {
                      const prevIndex = currentImageIndex === 0 ? currentAction.images.length - 1 : currentImageIndex - 1;
                      setNextImageIndex(prevIndex);
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentImageIndex(prevIndex);
                        setIsTransitioning(false);
                      }, 1000);
                    }
                  }}
                >
                  &#8249;
                </button>
                
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-200"
                  onClick={() => {
                    if (!isTransitioning) {
                      const nextIndex = (currentImageIndex + 1) % currentAction.images.length;
                      setNextImageIndex(nextIndex);
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentImageIndex(nextIndex);
                        setIsTransitioning(false);
                      }, 1000);
                    }
                  }}
                >
                  &#8250;
                </button>
              </div>
            </div>
            
            {/* Barra de informações */}
            <div className="h-16 flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 bg-opacity-90">
              <div className="text-white text-center">
                <div className="text-sm font-medium">
                  {currentImage.filename} ({(currentImageIndex % currentAction.images.length) + 1} de {currentAction.images.length})
                </div>
                <div className="text-xs opacity-75">
                  Ciclo: {Math.floor(currentImageIndex / currentAction.images.length) + 1} | 
                  Próxima em {Math.ceil((SLIDE_INTERVAL_MS - (Date.now() % SLIDE_INTERVAL_MS)) / 1000)}s
                </div>
              </div>
            </div>
          </div>
        );

      case 'layout_2':
        // 2 imagens com QR Code
        const leftIndex = leftImageIndex % currentAction.images.length;
        const rightIndex = rightImageIndex % currentAction.images.length;
        
        const currentLeftImage = currentAction.images[leftIndex];
        const currentRightImage = currentAction.images[rightIndex];
        
        // Calcular proporções dinâmicas
        const leftAR = currentLeftImage ? (imageAspectById[currentLeftImage.id] || null) : null;
        const rightAR = currentRightImage ? (imageAspectById[currentRightImage.id] || null) : null;
        let leftPercent = 50;
        let rightPercent = 50;
        if (leftAR && rightAR) {
          const total = leftAR + rightAR;
          leftPercent = (leftAR / total) * 100;
          rightPercent = 100 - leftPercent;
        }

        return (
          <div className="w-full h-full flex relative">
            {/* Fita informativa à esquerda */}
            <div className="flex-shrink-0 h-full info-strip" style={{ width: 'clamp(280px, 30vw, 400px)' }}>
              <div className="w-full h-full flex flex-col justify-between items-center p-6 text-white">
                
                {/* Logo no topo */}
                <div className="logo-container mb-4">
                  <img 
                    src="/images/logo.png" 
                    alt="Logo" 
                    className="max-w-full h-auto"
                    style={{ maxHeight: 'clamp(60px, 8vh, 100px)' }}
                  />
                </div>

                {/* QR Code */}
                <div className="qr-code-container mb-6 flex-1 flex flex-col justify-center items-center">
                  <div className="bg-white rounded-lg p-3 flex items-center justify-center mb-4" style={{ width: 'clamp(160px, 20vw, 240px)', height: 'clamp(160px, 20vw, 240px)' }}>
                    <QRCode
                      value={`${window.location.protocol}//${window.location.hostname}:${window.location.port}/galeria/${currentAction.id}`}
                      size={Math.min(window.innerWidth * 0.18, 220)}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                  
                  <div className="text-center px-2">
                    <p className="font-bold text-shadow-lg" style={{ 
                      fontSize: 'clamp(1rem, 2.2vw, 1.5rem)',
                      lineHeight: '1.3',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}>
                      Aponte sua câmera e veja todas as ofertas no seu celular.
                    </p>
                  </div>
                </div>

                {/* Vigência da oferta */}
                <div className="text-center bg-black bg-opacity-30 rounded-lg p-3 w-full">
                  <h4 className="font-bold mb-2" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}>
                    VÁLIDAS ATÉ:
                  </h4>
                  <div style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}>
                    <div>{formatDateBrazil(currentAction.end_date)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Container das imagens à direita */}
            <div className="flex-1 h-full flex" style={{ gap: '8px', minWidth: 0 }}>
              {/* Imagem da esquerda */}
              <div className="h-full" style={{ flex: `0 0 calc(${leftPercent}% - 4px)`, maxWidth: `calc(${leftPercent}% - 4px)`, minWidth: 0, overflow: 'hidden' }}>
                {currentLeftImage && (
                  <div className="w-full h-full">
                    {currentAction.has_border ? (
                      <div className="w-full h-full image-frame-bordered">
                        <img
                          src={`${API_URL}${currentLeftImage.url}`}
                          alt={currentLeftImage.filename}
                          className="w-full h-full object-contain"
                          style={mediaTransformStyle}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            const ar = target.naturalWidth && target.naturalHeight ? (target.naturalWidth / target.naturalHeight) : undefined;
                            if (ar) setImageAspectById(prev => ({ ...prev, [currentLeftImage.id]: ar }));
                            handleImageLoad(leftImageIndex, currentLeftImage.filename);
                          }}
                          onError={() => {
                            handleImageError(leftImageIndex, currentLeftImage.filename, `${API_URL}${currentLeftImage.url}`, 'esquerda');
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={`${API_URL}${currentLeftImage.url}`}
                        alt={currentLeftImage.filename}
                        className="w-full h-full object-contain"
                        style={mediaTransformStyle}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          const ar = target.naturalWidth && target.naturalHeight ? (target.naturalWidth / target.naturalHeight) : undefined;
                          if (ar) setImageAspectById(prev => ({ ...prev, [currentLeftImage.id]: ar }));
                          handleImageLoad(leftImageIndex, currentLeftImage.filename);
                        }}
                        onError={() => {
                          handleImageError(leftImageIndex, currentLeftImage.filename, `${API_URL}${currentLeftImage.url}`, 'esquerda');
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
              
              {/* Imagem da direita */}
              <div className="h-full" style={{ flex: `0 0 calc(${rightPercent}% - 4px)`, maxWidth: `calc(${rightPercent}% - 4px)`, minWidth: 0, overflow: 'hidden' }}>
                {currentRightImage && (
                  <div className="w-full h-full">
                    {currentAction.has_border ? (
                      <div className="w-full h-full image-frame-bordered">
                        <img
                          src={`${API_URL}${currentRightImage.url}`}
                          alt={currentRightImage.filename}
                          className="w-full h-full object-contain"
                          style={mediaTransformStyle}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            const ar = target.naturalWidth && target.naturalHeight ? (target.naturalWidth / target.naturalHeight) : undefined;
                            if (ar) setImageAspectById(prev => ({ ...prev, [currentRightImage.id]: ar }));
                            handleImageLoad(rightImageIndex, currentRightImage.filename);
                          }}
                          onError={() => {
                            handleImageError(rightImageIndex, currentRightImage.filename, `${API_URL}${currentRightImage.url}`, 'direita');
                          }}
                        />
                      </div>
                    ) : (
                      <img
                        src={`${API_URL}${currentRightImage.url}`}
                        alt={currentRightImage.filename}
                        className="w-full h-full object-contain"
                        style={mediaTransformStyle}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          const ar = target.naturalWidth && target.naturalHeight ? (target.naturalWidth / target.naturalHeight) : undefined;
                          if (ar) setImageAspectById(prev => ({ ...prev, [currentRightImage.id]: ar }));
                          handleImageLoad(rightImageIndex, currentRightImage.filename);
                        }}
                        onError={() => {
                          handleImageError(rightImageIndex, currentRightImage.filename, `${API_URL}${currentRightImage.url}`, 'direita');
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'layout_3':
        // 3 imagens - 33% cada
        return (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 flex flex-col md:flex-row gap-1 sm:gap-2 md:gap-2 lg:gap-3 p-2 sm:p-3 md:p-4 lg:p-6">
              {Array.from({ length: 3 }, (_, index) => {
                const imageIndex = (currentImageIndex + index) % currentAction.images.length;
                const image = currentAction.images[imageIndex];
                return (
                  <div key={index} className="flex-1 h-full min-h-[30vh] md:min-h-full">
                    <div className="image-frame-small w-full h-full">
                      <img
                        src={`${API_URL}${image.url}`}
                        alt={image.filename}
                        className="w-full h-full object-contain"
                        style={mediaTransformStyle}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="h-12 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-center text-sm">
                Imagens {(currentImageIndex % currentAction.images.length) + 1}-{Math.min((currentImageIndex % currentAction.images.length) + 3, currentAction.images.length)} de {currentAction.images.length} | 
                Ciclo: {Math.floor(currentImageIndex / currentAction.images.length) + 1}
              </div>
            </div>
          </div>
        );

      case 'layout_4':
        // 4 imagens - grid 2x2
        return (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 grid-rows-4 sm:grid-rows-2 gap-1 sm:gap-2 md:gap-2 lg:gap-3 p-2 sm:p-3 md:p-4 lg:p-6">
              {Array.from({ length: 4 }, (_, index) => {
                const imageIndex = (currentImageIndex + index) % currentAction.images.length;
                const image = currentAction.images[imageIndex];
                return (
                  <div key={index} className="w-full h-full min-h-[25vh] sm:min-h-full">
                    {currentAction.has_border ? (
                      <div className="w-full h-full image-frame-bordered">
                        <img
                          src={`${API_URL}${image.url}`}
                          alt={image.filename}
                          className="w-full h-full object-contain"
                          style={mediaTransformStyle}
                        />
                      </div>
                    ) : (
                      <img
                        src={`${API_URL}${image.url}`}
                        alt={image.filename}
                        className="w-full h-full object-contain rounded-lg"
                        style={mediaTransformStyle}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="h-12 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-center text-sm">
                Imagens {(currentImageIndex % currentAction.images.length) + 1}-{Math.min((currentImageIndex % currentAction.images.length) + 4, currentAction.images.length)} de {currentAction.images.length} | 
                Ciclo: {Math.floor(currentImageIndex / currentAction.images.length) + 1}
              </div>
            </div>
          </div>
        );

      default:
        return renderLayout();
    }
  };

  return (
    <div className="h-screen bg-black">
      {renderLayout()}

      {SHOW_DEBUG_INFO && import.meta.env.DEV && (
        <div className="absolute bottom-4 right-4 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
          <div>API: {API_URL}</div>
          <div>Painel: {panelId || fixedUrl}</div>
          <div>Ação: {currentAction?.name || 'Sem nome'}</div>
          <div>Layout: {layoutType}</div>
          <div>Imagens: {currentAction?.images?.length || 0}</div>
        </div>
      )}
    </div>
  );
};

export default PlayerTVPage;
