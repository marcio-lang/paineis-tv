import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { panelService, PanelViewData, PanelProduct } from '../../services/panelService';
import { AnimatedPage } from '../../components/ui/AnimatedPage';

export const TVPanelPage: React.FC = () => {
  const { departmentId, panelId } = useParams<{ departmentId: string; panelId: string }>();
  const navigate = useNavigate();
  
  const [panelData, setPanelData] = useState<PanelViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Entrar em fullscreen automaticamente
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(console.error);
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  };

  // Carregar dados do painel
  const loadPanelData = async () => {
    if (!departmentId || !panelId) {
      setError('Parâmetros de departamento e painel são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      console.log(`🔄 TVPanelPage: Carregando painel ${panelId} do departamento ${departmentId}...`);
      setLoading(true);
      setError(null);
      
      const data = await panelService.viewPanel(departmentId, panelId);
      console.log('📦 TVPanelPage: Dados do painel recebidos:', data);
      
      setPanelData(data);
    } catch (error: any) {
      console.error('❌ TVPanelPage: Erro ao carregar painel:', error);
      setError(error.message || 'Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPanelData();
    
    // Entrar em fullscreen após carregar
    const fullscreenTimer = setTimeout(() => {
      enterFullscreen();
    }, 1000);
    
    // Atualizar horário a cada segundo
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearTimeout(fullscreenTimer);
      clearInterval(timeInterval);
    };
  }, [departmentId, panelId]);

  // Configurar polling baseado na config do painel
  useEffect(() => {
    if (!panelData?.config) return;
    
    // Configurar polling para recarregar dados
    const pollingInterval = setInterval(() => {
      loadPanelData();
    }, (panelData.config.polling_interval || 10) * 1000);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [panelData?.config]);

  // Criar grid posicional 6x4
  const createPositionalGrid = () => {
    if (!panelData?.products) return [];
    
    const organizedProducts = panelService.organizeByPosition(panelData.products);
    return panelService.createPositionalGrid(organizedProducts);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
          <div className="text-white text-2xl font-bold animate-pulse">Carregando painel...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-3xl font-bold mb-4">Erro ao carregar painel</div>
          <div className="text-xl mb-8">{error}</div>
          <button
            onClick={() => navigate('/departamentos')}
            className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Voltar aos Departamentos
          </button>
        </div>
      </div>
    );
  }

  if (!panelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📺</div>
          <div className="text-3xl font-bold mb-4">Painel não encontrado</div>
          <button
            onClick={() => navigate('/departamentos')}
            className="bg-white text-gray-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Voltar aos Departamentos
          </button>
        </div>
      </div>
    );
  }

  const gridProducts = createPositionalGrid();
  const { department, panel, config, products } = panelData;

  // Definir cor do departamento ou usar padrão
  const departmentColor = department.color || '#6B7280';
  
  const backgroundStyle = {
    background: `linear-gradient(135deg, ${departmentColor} 0%, ${departmentColor}CC 100%)`
  } as React.CSSProperties;

  return (
    <AnimatedPage>
      <div 
        className="min-h-screen text-white relative overflow-hidden"
        style={backgroundStyle}
      >
        {/* Header */}
        <div className="relative z-10 p-8">
          <div className="flex justify-between items-start">
            <div className="animate-fade-in-up">
              <h1 className="text-6xl font-bold text-black mb-2 text-shadow-lg animate-fade-in-up">
                {config.title || panel.title || department.name.toUpperCase()}
              </h1>
              {config.subtitle && (
                <h2 className="text-3xl font-medium text-black/80 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {config.subtitle}
                </h2>
              )}
            </div>
            <div className="text-right animate-fade-in-down">
              <div className="text-3xl font-bold mb-1 tabular-nums text-black">
                {currentTime.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-lg text-black">
                {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Grid Posicional 6x4 */}
        <div className="relative z-10 px-8 pb-8">
          {products.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-4xl font-bold mb-4 animate-bounce">Nenhum produto disponível</div>
              <div className="text-xl opacity-75">Em breve novos produtos!</div>
            </div>
          ) : (
            <div className="grid grid-cols-6 grid-rows-4 gap-6">
              {gridProducts.map((product, index) => {
                const position = index + 1; // Posição 1-24
                
                if (product) {
                  // Slot ocupado - mostrar produto
                  return (
                    <div
                      key={`product-${product.id}`}
                      className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transform transition-all duration-500 border border-white/20 hover:shadow-3xl hover:scale-105 animate-fade-in-up group"
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      {/* Espaçamento superior */}
                      <div className="mb-4"></div>

                      {/* Nome do Produto */}
                      <h3 className="text-gray-900 font-bold text-xl mb-3 leading-tight group-hover:text-opacity-80 transition-colors duration-300"
                          style={{ color: departmentColor }}>
                        {product.nome}
                      </h3>

                      {/* Preço */}
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300 tabular-nums"
                             style={{ color: departmentColor }}>
                          {panelService.formatPrice(product.preco)}
                        </div>
                        <div className="text-gray-600 text-sm font-medium">
                          por kg
                        </div>
                      </div>

                      {/* Decoração animada */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-center">
                          <div 
                            className="w-12 h-1 rounded-full group-hover:w-16 transition-all duration-300"
                            style={{ background: `linear-gradient(to right, ${departmentColor}, ${departmentColor}CC)` }}
                          ></div>
                        </div>
                      </div>

                      {/* Efeito de brilho no hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  );
                } else {
                  // Slot vazio - mostrar placeholder
                  return (
                    <div
                      key={`empty-${position}`}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-dashed border-white/30 flex flex-col items-center justify-center text-white/50 transition-all duration-500 hover:bg-white/20"
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center font-bold text-lg mb-3">
                        {position}
                      </div>
                      <div className="text-sm font-medium text-center">
                        Posição<br />Disponível
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {config.footer_text && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-6 animate-fade-in-up">
            <div className="text-center">
              <p className="text-xl text-white font-medium animate-pulse-slow">
                {config.footer_text}
              </p>
            </div>
          </div>
        )}

        {/* Animação de fundo aprimorada */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-white rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-white rounded-full animate-float-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-white rounded-full animate-float-reverse"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full animate-ping opacity-20"></div>
        </div>

        {/* Efeito de brilho dinâmico */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none animate-pulse-slow"></div>
        
        {/* Partículas flutuantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
};

// Estilos CSS adicionais para animações e efeitos
const styles = `
  .text-shadow-lg {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(-180deg); }
  }
  
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-10px) scale(1.1); }
  }
  
  @keyframes float-reverse {
    0%, 100% { transform: translateY(-10px) rotate(0deg); }
    50% { transform: translateY(10px) rotate(360deg); }
  }
  
  @keyframes float-particle {
    0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100px) translateX(50px) rotate(360deg); opacity: 0; }
  }
  
  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fade-in-down {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 2s; }
  .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
  .animate-float-reverse { animation: float-reverse 5s ease-in-out infinite 1s; }
  .animate-float-particle { animation: float-particle linear infinite; }
  .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
  .animate-fade-in { animation: fade-in 1s ease-out; }
  .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
  .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
  
  .hover\\:shadow-3xl:hover {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
  }
`;

// Injetar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}