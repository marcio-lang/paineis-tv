import React, { useState, useEffect } from 'react';
import { butcherService, ButcherProduct, ButcherConfig } from '../../services/butcherService';
import { departmentService } from '../../services/departmentService';
import { AnimatedPage, StaggeredAnimation } from '../../components/ui/AnimatedPage';

export const ButcherTVPage: React.FC = () => {
  const [products, setProducts] = useState<ButcherProduct[]>([]);
  const [config, setConfig] = useState<ButcherConfig | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      const departments = await departmentService.getDepartments();
      const acougue = Array.isArray(departments) ? departments.find(d => d.code === 'ACG') : null;
      if (acougue) {
        const panels = await departmentService.getDepartmentPanels(acougue.id);
        const defaultPanel = Array.isArray(panels) ? panels.find(p => p.is_default) : null;
        if (defaultPanel) {
          const viewData = await departmentService.viewDepartmentPanel(acougue.id, defaultPanel.id);
          const backendProducts = (viewData?.products || []) as any[];
          const formatted = backendProducts.map((p: any) => ({
            id: String(p.id),
            codigo: p.codigo,
            name: p.nome ?? p.name ?? '',
            price: Number(p.preco ?? p.price ?? 0),
            position: Number(p.posicao ?? p.position ?? 1),
            is_active: Boolean(p.ativo ?? p.is_active ?? true),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })) as ButcherProduct[];
          let filtered = formatted;
          const rawKeywords = (viewData?.department?.keywords || '').trim();
          if (rawKeywords) {
            let keywords: string[] = [];
            try {
              const parsed = JSON.parse(rawKeywords);
              if (Array.isArray(parsed)) keywords = parsed;
            } catch {
              keywords = rawKeywords.split(',').map(k => k.trim()).filter(Boolean);
            }
            if (keywords.length > 0) {
              const norm = (s: string) => {
                return (s || '')
                  .normalize('NFD')
                  .replace(/\p{Diacritic}/gu, '')
                  .toLowerCase()
                  .replace(/\s+/g, ' ')
                  .trim();
              };
              const kws = keywords.map(k => norm(k));
              filtered = formatted.filter(p => {
                const n = norm(p.name || '');
                return kws.some(k => n === k);
              });
            }
          }
          const organizedProducts = butcherService.organizeByPosition(filtered);
          setProducts(organizedProducts);
          const cfg: ButcherConfig = {
            polling_interval: viewData?.config?.polling_interval ?? defaultPanel.polling_interval,
            title: viewData?.config?.title ?? defaultPanel.title,
            footer_text: viewData?.config?.footer_text ?? defaultPanel.footer_text
          };
          setConfig(cfg);
          return;
        }
      }
      const [productsData, configData] = await Promise.all([
        butcherService.getActiveProducts(),
        butcherService.getConfig()
      ]);
      const organizedProducts = butcherService.organizeByPosition(productsData || []);
      setProducts(organizedProducts);
      setConfig(configData);
    } catch (error) {
      try {
        const [productsData, configData] = await Promise.all([
          butcherService.getActiveProducts(),
          butcherService.getConfig()
        ]);
        const organizedProducts = butcherService.organizeByPosition(productsData || []);
        setProducts(organizedProducts);
        setConfig(configData);
      } catch (err) {
        console.error('Erro ao carregar dados do painel do açougue', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
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
  }, []);

  // Configurar polling baseado na config
  useEffect(() => {
    if (!config) return;
    
    // Configurar polling para recarregar dados
    const pollingInterval = setInterval(() => {
      loadData();
    }, (config.polling_interval || 10) * 1000);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [config]);

  // Criar grid 6x4 com produtos nas posições corretas
  const createPositionalGrid = () => {
    const grid: (ButcherProduct | null)[] = new Array(24).fill(null);
    
    // Colocar cada produto na sua posição específica (posição 1-24 -> índice 0-23)
    products.forEach(product => {
      // Tentar colocar na posição solicitada se estiver livre
      if (product.position >= 1 && product.position <= 24 && grid[product.position - 1] === null) {
        grid[product.position - 1] = product;
      } else {
        // Se a posição já estiver ocupada ou estiver fora do range (1-24), 
        // colocar na primeira posição livre disponível
        const freeIndex = grid.findIndex(slot => slot === null);
        if (freeIndex !== -1) {
          grid[freeIndex] = product;
        }
      }
    });
    
    return grid;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
          <div className="text-white text-2xl font-bold animate-pulse">Carregando...</div>
        </div>
      </div>
    );
  }

  const gridProducts = createPositionalGrid();
  console.log('🔍 ButcherTVPage: Grid criado:', gridProducts.length, 'slots');
  console.log('🔍 ButcherTVPage: Produtos no grid:', gridProducts.filter(p => p !== null).length);
  // Removido uso de imagem de fundo inexistente; usar apenas gradiente fixo
  const backgroundStyle = {
    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
  } as React.CSSProperties;

  return (
    <AnimatedPage>
      <div 
        className="min-h-screen text-white relative overflow-hidden"
        style={backgroundStyle}
      >
        {/* Header */}
        <div className="relative z-10 p-4">
          <div className="flex justify-between items-start">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl font-bold text-black mb-2 text-shadow-lg animate-fade-in-up">
                {config?.title || 'AÇOUGUE PREMIUM'}
              </h1>
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
        <div className="relative z-10 px-6 pb-4">
            {products.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="text-4xl font-bold mb-4 animate-bounce">Nenhum produto disponível</div>
                <div className="text-xl text-red-100">Em breve novos produtos!</div>
              </div>
            ) : (
              <div className="grid grid-cols-6 grid-rows-4 gap-4">
                {gridProducts.map((product, index) => {
                    const position = index + 1; // Posição 1-24
                    
                    if (product) {
                      // Slot ocupado - mostrar produto
                      return (
                        <div
                          key={`product-${product.id}`}
                          className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl transform transition-all duration-500 border border-white/20 hover:shadow-3xl hover:scale-105 animate-fade-in-up group overflow-hidden"
                          style={{ 
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          {/* Espaçamento superior removido para reduzir respiro */}

                          {/* Nome do Produto */}
                          <h3 className="text-gray-900 font-bold text-xl mb-3 leading-tight group-hover:text-red-700 transition-colors duration-300">
                            {product.name.toUpperCase()}
                          </h3>

                          {/* Preço */}
                          <div className="text-center w-full">
                            {(() => {
                              const priceText = butcherService.formatPrice(product.price);
                              const digitCount = priceText.replace(/[^0-9]/g, '').length;
                              const sizeClass = digitCount <= 3 ? 'text-4xl' : (digitCount === 4 ? 'text-3xl' : 'text-2xl');
                              return (
                                <div className={`${sizeClass} leading-none font-bold text-red-600 mb-1 tabular-nums tracking-tight whitespace-nowrap max-w-full mx-auto px-1`}>
                                  {priceText}
                                </div>
                              );
                            })()}
                            <div className="text-gray-600 text-xs font-medium mt-0.5">
                              por kg
                            </div>
                          </div>

                          {/* Decoração animada */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-center">
                              <div className="w-12 h-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full group-hover:w-16 transition-all duration-300"></div>
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
         {config?.footer_text && (
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
