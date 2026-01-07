import React, { useState, useEffect } from 'react';
import { AnimatedPage } from '../ui/AnimatedPage';
import { butcherService } from '../../services/butcherService';

interface Product {
  id: string;
  name: string;
  price: number;
  position: number;
  is_active: boolean;
  codigo?: string;
}

interface PanelConfig {
  title?: string;
  subtitle?: string;
  footer_text?: string;
  polling_interval?: number;
}

interface Department {
  id: string;
  name: string;
  color: string;
  code: string;
}

interface StandardTVPanelProps {
  products: Product[];
  config: PanelConfig;
  department: Department;
  loading?: boolean;
}

export const StandardTVPanel: React.FC<StandardTVPanelProps> = ({
  products,
  config,
  department,
  loading = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pageIndex, setPageIndex] = useState(0);
  const PAGE_SIZE = 20;
  const COLS = 5;
  const ROWS = 4;

  const getPriceFontSize = (priceText: string) => {
    const digits = priceText.replace(/[^0-9]/g, '').length;
    const base = digits <= 3 ? 0.27 : (digits === 4 ? 0.24 : 0.21);
    return `clamp(2rem, calc((100vw - 96px) / ${COLS} * ${base}), 4.8rem)`;
  };

  useEffect(() => {
    const el = document.documentElement;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  // Atualizar horário a cada segundo
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const createPagedGrid = (page: number) => {
    const sorted = [...products].sort((a, b) => {
      const pa = typeof a.position === 'number' ? a.position : Number.MAX_SAFE_INTEGER;
      const pb = typeof b.position === 'number' ? b.position : Number.MAX_SAFE_INTEGER;
      return pa - pb;
    });
    const start = page * PAGE_SIZE;
    const slice = sorted.slice(start, start + PAGE_SIZE);
    const grid: (Product | null)[] = new Array(PAGE_SIZE).fill(null);
    slice.forEach((p, idx) => {
      grid[idx] = p;
    });
    return grid;
  };

  // Definir cores baseadas no código do departamento (ACG, HRT, PAD)
  const getDepartmentColors = () => {
    // Usar a cor definida no departamento, se disponível
    if (department.color) {
      return {
        primary: department.color,
        secondary: adjustColorBrightness(department.color, -20), // 20% mais escuro
        accent: adjustColorBrightness(department.color, 20), // 20% mais claro
        gradient: `linear-gradient(135deg, ${department.color} 0%, ${adjustColorBrightness(department.color, -20)} 100%)`
      };
    }

    const code = (department?.code || '').toUpperCase();
    switch (code) {
      case 'ACG':
        return {
          primary: '#DC2626', // vermelho (Açougue)
          secondary: '#991B1B',
          accent: '#EF4444',
          gradient: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
        };
      case 'HRT':
        return {
          primary: '#059669', // verde (Hortifrúti)
          secondary: '#047857',
          accent: '#10B981',
          gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
        };
      case 'PAD':
        return {
          primary: '#D97706', // laranja (Padaria)
          secondary: '#92400E',
          accent: '#F59E0B',
          gradient: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)'
        };
      default:
        return {
          primary: '#3B82F6', // azul padrão
          secondary: '#1D4ED8',
          accent: '#60A5FA',
          gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
        };
    }
  };

  // Função auxiliar para ajustar brilho da cor (hex)
  const adjustColorBrightness = (hex: string, percent: number) => {
    // Remover hash
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // Converter para RGB
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    // Ajustar brilho
    r = Math.round(r * (1 + percent / 100));
    g = Math.round(g * (1 + percent / 100));
    b = Math.round(b * (1 + percent / 100));

    // Garantir limites 0-255
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    // Converter de volta para Hex
    const rr = (r.toString(16).length === 1 ? '0' : '') + r.toString(16);
    const gg = (g.toString(16).length === 1 ? '0' : '') + g.toString(16);
    const bb = (b.toString(16).length === 1 ? '0' : '') + b.toString(16);

    return `#${rr}${gg}${bb}`;
  };

  if (loading) {
    const colors = getDepartmentColors();
          return (
            <div 
              className="min-h-screen flex items-center justify-center"
              style={{ background: colors.gradient }}
            >
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
          <div className="text-white text-2xl font-bold animate-pulse">Carregando...</div>
        </div>
      </div>
    );
  }

  const gridProducts = createPagedGrid(pageIndex);
  const colors = getDepartmentColors();
  const productNameColor = department.product_name_color || '#000000';
  const priceColor = department.price_color || colors.primary;
  const priceBackgroundColor = department.price_background_color || '#FFFFFF';

  // Removido uso de imagem de fundo inexistente; usar apenas gradiente do departamento
  const backgroundStyle = {
    background: colors.gradient
  } as React.CSSProperties;

  useEffect(() => {
    setPageIndex(0);
  }, [products.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
      setPageIndex(prev => (prev + 1) % totalPages);
    }, 6000);
    return () => clearInterval(interval);
  }, [products.length]);

  return (
    <AnimatedPage>
      <div 
        className="min-h-screen text-white relative overflow-hidden"
        style={{ ...backgroundStyle, paddingBottom: '2.5vh' }}
      >
        {/* Header */}
        <div className="relative z-10 p-3 sm:p-4 md:p-6">
          <div className="flex justify-between items-start">
            <div className="animate-fade-in-up">
              <h1 className="font-bold text-black mb-2 text-shadow-lg animate-fade-in-up" style={{ fontSize: 'clamp(2rem, 4.5vw, 5rem)' }}>
                {config?.title || department.name.toUpperCase()}
              </h1>
              {(() => {
                const subtitle = (config?.subtitle || '').trim();
                const shouldShow = subtitle && subtitle.toLowerCase() !== 'produtos selecionados';
                return shouldShow ? (
                  <p className="text-black/80 font-medium animate-fade-in-up" style={{ animationDelay: '0.2s', fontSize: 'clamp(1rem, 2.2vw, 1.75rem)' }}>
                    {subtitle}
                  </p>
                ) : null;
              })()}
            </div>
            <div className="text-right animate-fade-in-down">
              <div className="font-bold mb-1 tabular-nums text-black" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2.5rem)' }}>
                {currentTime.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-black" style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.25rem)' }}>
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

        <div className="relative z-10 px-3 sm:px-4 md:px-6 pb-4">
            {products.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="text-4xl font-bold mb-4 animate-bounce">Nenhum produto disponível</div>
                <div className="text-xl opacity-80">Em breve novos produtos!</div>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 md:gap-6" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
                {gridProducts.map((product, index) => {
                  const position = pageIndex * PAGE_SIZE + index + 1;
                    
                    if (product) {
                      return (
                        <div
                          key={`product-${product.id}`}
                          className="backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-2xl transform transition-all duration-500 border border-white/20 hover:shadow-3xl hover:scale-105 animate-fade-in-up group overflow-hidden flex flex-col"
                          style={{ 
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'both',
                            backgroundColor: priceBackgroundColor
                          }}
                        >

                          <h3 
                            className="font-bold mb-2 leading-tight group-hover:scale-105 transition-all duration-300"
                            style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', color: productNameColor }}
                          >
                            {product.name.toUpperCase()}
                          </h3>

                          <div className="text-center w-full flex-1 flex flex-col justify-center">
                            {(() => {
                              const priceText = butcherService.formatPrice(product.price);
                              const fontSize = getPriceFontSize(priceText);
                              const match = priceText.match(/^(\D+)(.+)$/);
                              const currency = match ? match[1].trim() : '';
                              const amount = match ? match[2].trim() : priceText;
                              return (
                                <div 
                                  className={`leading-none font-bold mb-1 tabular-nums tracking-tight whitespace-nowrap max-w-full mx-auto px-1`}
                                  style={{ color: priceColor, fontSize, lineHeight: 1 }}
                                >
                                  {currency && (
                                    <span
                                      style={{
                                        fontSize: '0.45em',
                                        marginRight: '0.08em',
                                        display: 'inline-block',
                                        transform: 'translateY(-0.14em)'
                                      }}
                                    >
                                      {currency}
                                    </span>
                                  )}
                                  <span>{amount}</span>
                                </div>
                              );
                            })()}
                            <div className="text-gray-600 font-medium mt-0.5" style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.15rem)' }}>
                              por kg
                            </div>
                          </div>

                          {/* Decoração animada */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-center">
                              <div 
                                className="w-12 h-0.5 rounded-full group-hover:w-16 transition-all duration-300"
                                style={{ 
                                  background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`
                                }}
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
                          className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border-2 border-dashed border-white/30 flex flex-col items-center justify-center text-white/50 transition-all duration-500 hover:bg-white/20"
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
           <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-3 sm:p-6 animate-fade-in-up">
             <div className="text-center">
               <p className="text-white font-medium animate-pulse-slow" style={{ fontSize: 'clamp(0.9rem, 3vw, 1.25rem)' }}>
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

// Estilos CSS customizados
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

// Injetar estilos no documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
