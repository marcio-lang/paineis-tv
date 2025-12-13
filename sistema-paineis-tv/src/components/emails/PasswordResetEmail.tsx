
interface PasswordResetEmailProps {
  userName: string;
  resetLink: string;
  expirationTime: string;
}

export function PasswordResetEmail({ userName, resetLink, expirationTime }: PasswordResetEmailProps) {
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
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
          }}>🔐</span>
        </div>
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 10px 0'
        }}>
          Redefinir sua senha
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '16px',
          margin: '0'
        }}>
          Solicitação de alteração de senha
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
          marginBottom: '20px'
        }}>
          Recebemos uma solicitação para redefinir a senha da sua conta. Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha.
        </p>

        {/* Security Alert */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
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
              color: '#d97706'
            }}>⚠️</span>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#92400e',
                margin: '0 0 8px 0'
              }}>
                Importante
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#92400e',
                margin: '0'
              }}>
                Este link expira em <strong>{expirationTime}</strong>. Se você não solicitou esta alteração, ignore este email e sua senha permanecerá inalterada.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center' as const, marginBottom: '30px' }}>
          <a
            href={resetLink}
            style={{
              display: 'inline-block',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            Redefinir minha senha
          </a>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
        </p>

        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '30px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#374151',
            margin: '0',
            wordBreak: 'break-all' as const
          }}>
            {resetLink}
          </p>
        </div>

        {/* Security Tips */}
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
            Dicas de segurança:
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
              }}>💡</span>
              Use uma senha forte com pelo menos 8 caracteres
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
              }}>🔒</span>
              Combine letras maiúsculas, minúsculas, números e símbolos
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
              }}>🚫</span>
              Evite usar informações pessoais óbvias
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
              }}>🔐</span>
              Considere ativar a autenticação de dois fatores
            </li>
          </ul>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          Se você não solicitou esta alteração, entre em contato conosco imediatamente através do nosso suporte.
        </p>

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
            <strong>Suspeita de atividade não autorizada?</strong><br />
            Entre em contato conosco imediatamente: suporte@empresa.com
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
              Suporte
            </a>
            <a href="#" style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Política de Privacidade
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
