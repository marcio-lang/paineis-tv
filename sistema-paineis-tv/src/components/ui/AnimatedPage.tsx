import React, { useEffect, useState } from 'react';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide-up' | 'slide-right' | 'scale';
  delay?: number;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({
  children,
  className = '',
  animation = 'fade',
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch (animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-slide-in-up';
      case 'slide-right':
        return 'animate-slide-in-right';
      case 'scale':
        return 'animate-scale-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div className={`${getAnimationClass()} ${className}`}>
      {children}
    </div>
  );
};

// Componente para animações em sequência
export const StaggeredAnimation: React.FC<{
  children: React.ReactNode[];
  staggerDelay?: number;
  animation?: 'fade' | 'slide-up' | 'slide-right' | 'scale';
}> = ({
  children,
  staggerDelay = 100,
  animation = 'slide-up',
}) => {
  return (
    <>
      {children.map((child, index) => (
        <AnimatedPage
          key={index}
          animation={animation}
          delay={index * staggerDelay}
        >
          {child}
        </AnimatedPage>
      ))}
    </>
  );
};