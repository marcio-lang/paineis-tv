
interface WelcomeEmailProps {
  userName: string;
  verificationLink: string;
}

export function WelcomeEmail({ userName, verificationLink }: WelcomeEmailProps) {
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            fontWeight: 'bold',
            color: '#ffffff',
            fontFamily: '"Pacifico", serif'
          }}>L</span>
        </div>
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 10px 0'
        }}>
          Bem-vindo ao nosso sistema!
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '16px',
          margin: '0'
        }}>
          Estamos felizes em tê-lo conosco
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
          Obrigado por se cadastrar em nossa plataforma. Para começar a usar todos os recursos disponíveis, você precisa verificar seu endereço de email.
        </p>

        <p style={{
          fontSize: '16px',
          color: '#4b5563',
          marginBottom: '30px'
        }}>
          Clique no botão abaixo para verificar sua conta:
        </p>

        {/* CTA Button */}
        <div style={{ textAlign: 'center' as const, marginBottom: '30px' }}>
          <a
            href={verificationLink}
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            Verificar minha conta
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
            {verificationLink}
          </p>
        </div>

        {/* Features */}
        <div style={{
          backgroundColor: '#f8fafc',
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
            O que você pode fazer:
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: '0',
            margin: '0'
          }}>
            <li style={{
              display: 'flex',
              alignItems: 'center',
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
                color: '#ffffff'
              }}>✓</span>
              Gerenciar seus dados e preferências
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
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
                color: '#ffffff'
              }}>✓</span>
              Acessar relatórios e análises
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
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
                color: '#ffffff'
              }}>✓</span>
              Configurar notificações personalizadas
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
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
                color: '#ffffff'
              }}>✓</span>
              Conectar com nossa equipe de suporte
            </li>
          </ul>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          Se você não criou esta conta, pode ignorar este email com segurança.
        </p>

        <p style={{
          fontSize: '16px',
          color: '#4b5563',
          margin: '0'
        }}>
          Atenciosamente,<br />
          <strong>Equipe de Suporte</strong>
        </p>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '30px 20px',
        borderTop: '1px solid #e5e7eb'
      }}>
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
              Central de Ajuda
            </a>
            <a href="#" style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Política de Privacidade
            </a>
            <a href="#" style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Termos de Uso
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
