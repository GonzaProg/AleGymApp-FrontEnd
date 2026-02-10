import React from 'react';

interface BackgroundLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const BackgroundLayout: React.FC<BackgroundLayoutProps> = ({ children, className = "" }) => {
  return (
    <div style={styles.container} className={className}>
      {/* --- CAPA 0: NEON AURORA ANIMADA (Z-Index 0) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Aurora Norte - Violeta/Blue */}
        <div style={styles.auroraNorth}></div>
        
        {/* Aurora Sur - Cyan/Green */}
        <div style={styles.auroraSouth}></div>
        
        {/* Aurora Este - Pink/Orange */}
        <div style={styles.auroraEast}></div>
        
        {/* Aurora Oeste - Purple/Blue */}
        <div style={styles.auroraWest}></div>
        
        {/* Estrellas parpadeantes */}
        <div style={styles.starsContainer}>
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{
              ...styles.star,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }} />
          ))}
        </div>
        
        {/* Nebulosa central */}
        <div style={styles.nebula}></div>
      </div>

      {/* --- CAPA 1: CONTENIDO REAL (Z-Index 10) --- */}
      <div className="relative z-10 flex-1 flex flex-col w-full h-full">
        {children}
      </div>
      
      {/* --- ESTILOS CSS GLOBALES PARA ANIMACIONES --- */}
      <style>{`
        @keyframes aurora {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) rotate(1deg) scale(1.1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(10px) rotate(-1deg) scale(0.9);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-10px) rotate(2deg) scale(1.05);
            opacity: 0.6;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at center, #0a0e27 0%, #020515 50%, #000000 100%)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  auroraNorth: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '120vw',
    height: '40vh',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 25%, rgba(34, 211, 238, 0.1) 50%, rgba(168, 85, 247, 0.2) 75%, rgba(236, 72, 153, 0.1) 100%)',
    filter: 'blur(40px)',
    borderRadius: '50%',
    animation: 'aurora 15s infinite ease-in-out',
    transform: 'rotate(-15deg)',
  },
  auroraSouth: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '120vw',
    height: '40vh',
    background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.3) 25%, rgba(6, 182, 212, 0.2) 50%, rgba(59, 130, 246, 0.1) 75%, rgba(139, 92, 246, 0.1) 100%)',
    filter: 'blur(45px)',
    borderRadius: '50%',
    animation: 'aurora 18s infinite ease-in-out reverse',
    transform: 'rotate(10deg)',
  },
  auroraEast: {
    position: 'absolute',
    top: '30%',
    right: '-15%',
    width: '80vw',
    height: '60vh',
    background: 'linear-gradient(225deg, rgba(236, 72, 153, 0.2) 0%, rgba(249, 115, 22, 0.1) 25%, rgba(245, 158, 11, 0.1) 50%, rgba(239, 68, 68, 0.1) 75%, rgba(219, 39, 119, 0.2) 100%)',
    filter: 'blur(50px)',
    borderRadius: '50%',
    animation: 'aurora 20s infinite ease-in-out 2s',
    transform: 'rotate(25deg)',
  },
  auroraWest: {
    position: 'absolute',
    top: '20%',
    left: '-15%',
    width: '80vw',
    height: '60vh',
    background: 'linear-gradient(315deg, rgba(139, 92, 246, 0.2) 0%, rgba(91, 33, 182, 0.1) 25%, rgba(109, 40, 217, 0.1) 50%, rgba(124, 58, 237, 0.1) 75%, rgba(167, 139, 250, 0.2) 100%)',
    filter: 'blur(55px)',
    borderRadius: '50%',
    animation: 'aurora 22s infinite ease-in-out 4s',
    transform: 'rotate(-20deg)',
  },
  starsContainer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    width: '2px',
    height: '2px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    animation: 'twinkle 3s infinite',
    boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
  },
  nebula: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '60vw',
    height: '60vw',
    transform: 'translate(-50%, -50%)',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.03) 30%, rgba(34, 211, 238, 0.02) 60%, transparent 100%)',
    filter: 'blur(100px)',
    borderRadius: '50%',
    animation: 'pulse 8s infinite ease-in-out',
  },
};