
interface TwoFactorEmailProps {
  userName: string;
  verificationCode: string;
  expirationTime: string;
  deviceInfo: string;
  location: string;
}

export function TwoFactorEmail({ userName, verificationCode, expirationTime, deviceInfo, location }: TwoFactorEmailProps) {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333333',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        padding: '40px 20px',
        textAlign: 'center' as const
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <span style={{
            fontSize: '24px',
            color: '#ffffff'
          }}>🛡️</span>
        </div>
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 10px 0'
        }}>
          Código de verificação
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '16px',
          margin: '0'
        }}>
          Autenticação de dois fatores
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 20px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          Olá, {userName}!
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#4b5563',
          marginBottom: '30px'
        }}>
          Detectamos uma tentativa de login na sua conta. Para garantir sua segurança, use o código abaixo para completar o processo de autenticação.
        </p>

        {/* Verification Code */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          padding: '30px',
          textAlign: 'center' as const,
          marginBottom: '30px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0 0 16px 0',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: '600'
          }}>
            Seu código de verificação
          </p>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1e293b',
            letterSpacing: '8px',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            backgroundColor: '#ffffff',
            border: '2px solid #8b5cf6',
            borderRadius: '8px',
            padding: '20px',
            margin: '0 auto',
            display: 'inline-block'
          }}>
            {verificationCode}
          </div>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '16px 0 0 0'
          }}>
            Válido por {expirationTime}
          </p>
        </div>

        {/* Login Details */}
        <div style={{
          backgroundColor: '#fef7ff',
          border: '1px solid #e9d5ff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Detalhes da tentativa de login:
          </h3>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#8b5cf6',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#ffffff'
              }}>🖥️</span>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0'
                }}>
                  Dispositivo
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {deviceInfo}
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#8b5cf6',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#ffffff'
              }}>📍</span>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0'
                }}>
                  Localização
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {location}
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#8b5cf6',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#ffffff'
              }}>⏰</span>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0'
                }}>
                  Horário
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Alert */}
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{
              fontSize: '20px',
              color: '#dc2626'
            }}>🚨</span>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#991b1b',
                margin: '0 0 8px 0'
              }}>
                Não foi você?
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#991b1b',
                margin: '0'
              }}>
                Se você não tentou fazer login, sua conta pode estar comprometida. Entre em contato conosco imediatamente e altere sua senha.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Como usar o código:
          </h3>
          <ol style={{
            listStyle: 'none',
            padding: '0',
            margin: '0',
            counterReset: 'step-counter'
          }}>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '12px',
              fontSize: '14px',
              color: '#4b5563',
              counterIncrement: 'step-counter'
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                color: '#ffffff',
                flexShrink: 0,
                marginTop: '2px'
              }}>1</span>
              Volte para a tela de login
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '12px',
              fontSize: '14px',
              color: '#4b5563'
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                color: '#ffffff',
                flexShrink: 0,
                marginTop: '2px'
              }}>2</span>
              Digite o código de 6 dígitos acima
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              fontSize: '14px',
              color: '#4b5563'
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                color: '#ffffff',
                flexShrink: 0,
                marginTop: '2px'
              }}>3</span>
              Clique em "Verificar" para acessar sua conta
            </li>
          </ol>
        </div>

        <p style={{
          fontSize: '16px',
          color: '#4b5563',
          margin: '0'
        }}>
          Atenciosamente,<br />
          <strong>Equipe de Segurança</strong>
        </p>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '30px 20px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#991b1b',
            margin: '0',
            textAlign: 'center' as const
          }}>
            <strong>Precisa de ajuda?</strong><br />
            Entre em contato: suporte@empresa.com | (11) 9999-9999
          </p>
        </div>

        <div style={{ textAlign: 'center' as const, marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex',
            gap: '16px'
          }}>
            <a href="#" style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Central de Segurança
            </a>
            <a href="#" style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Configurar 2FA
            </a>
            <a href="#" style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Suporte
            </a>
          </div>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#9ca3af',
          textAlign: 'center' as const,
          margin: '0'
        }}>
          © 2024 Sua Empresa. Todos os direitos reservados.<br />
          Rua Exemplo, 123 - São Paulo, SP - Brasil
        </p>
      </div>
    </div>
  );
}
