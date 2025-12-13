
interface PasswordChangedEmailProps {
  userName: string;
  changeTime: string;
  deviceInfo: string;
  location: string;
}

export function PasswordChangedEmail({ userName, changeTime, deviceInfo, location }: PasswordChangedEmailProps) {
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
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
          }}>✅</span>
        </div>
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 10px 0'
        }}>
          Senha alterada com sucesso
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '16px',
          margin: '0'
        }}>
          Sua conta está segura
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
          Sua senha foi alterada com sucesso. Esta é uma confirmação de que a alteração foi realizada em sua conta.
        </p>

        {/* Success Confirmation */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '2px solid #10b981',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center' as const,
          marginBottom: '30px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <span style={{
              fontSize: '24px',
              color: '#ffffff'
            }}>🔒</span>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#065f46',
            margin: '0 0 8px 0'
          }}>
            Alteração confirmada
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#047857',
            margin: '0'
          }}>
            Sua nova senha está ativa e sua conta permanece segura
          </p>
        </div>

        {/* Change Details */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
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
            Detalhes da alteração:
          </h3>
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#3b82f6',
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
                  Data e horário
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {changeTime}
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
                backgroundColor: '#3b82f6',
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
                backgroundColor: '#3b82f6',
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
                margin: '0 0 12px 0'
              }}>
                Se você não fez esta alteração, sua conta pode estar comprometida. Entre em contato conosco imediatamente.
              </p>
              <a
                href="mailto:suporte@empresa.com"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Reportar problema
              </a>
            </div>
          </div>
        </div>

        {/* Security Recommendations */}
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
            Recomendações de segurança:
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: '0',
            margin: '0'
          }}>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '12px',
              fontSize: '14px',
              color: '#4b5563'
            }}>
              <span style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                color: '#ffffff',
                flexShrink: 0,
                marginTop: '2px'
              }}>✓</span>
              Mantenha sua senha segura e não a compartilhe
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '12px',
              fontSize: '14px',
              color: '#4b5563'
            }}>
              <span style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                color: '#ffffff',
                flexShrink: 0,
                marginTop: '2px'
              }}>✓</span>
              Ative a autenticação de dois fatores para maior segurança
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '12px',
              fontSize: '14px',
              color: '#4b5563'
            }}>
              <span style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                color: '#ffffff',
                flexShrink: 0,
                marginTop: '2px'
              }}>✓</span>
              Monitore regularmente a atividade da sua conta
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              fontSize: '14px',
              color: '#4b5563'
            }}>
              <span style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                fontSize: '12px',
                color: '#ffffff',
                flexShrink: 0,
                marginTop: '2px'
              }}>✓</span>
              Use senhas únicas para cada serviço online
            </li>
          </ul>
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
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#065f46',
            margin: '0',
            textAlign: 'center' as const
          }}>
            <strong>Sua conta está segura!</strong><br />
            Continue aproveitando nossos serviços com tranquilidade.
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
              Configurações da Conta
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
