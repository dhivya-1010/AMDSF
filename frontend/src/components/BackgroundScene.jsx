import React, { useState, useEffect, useRef } from 'react';
import { SPACE_SCENES } from '../data/spaceImagery';

/**
 * BackgroundScene Component
 * Renders a full-screen, high-resolution space background with subtle parallax and smooth crossfades.
 */
export default function BackgroundScene({
  scene = 'earth',
  parallax = true,
  parallaxSpeed = 0.15,
  isFixed = true,
  overlayGradient = 'standard', // 'standard' | 'minimal' | 'strong' | 'none'
  overlayClassName = '',
  className = '',
  children,
}) {
  const [offsetY, setOffsetY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef(null);

  const sceneData = typeof scene === 'string' ? SPACE_SCENES[scene] || SPACE_SCENES.earth : scene;
  const imageSrc = sceneData?.image || scene;

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!parallax || prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (isFixed) {
            setOffsetY(window.scrollY * parallaxSpeed);
          } else if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const relativeOffset = (window.innerHeight - rect.top) * parallaxSpeed * 0.4;
            setOffsetY(relativeOffset);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallax, parallaxSpeed, isFixed]);

  const getOverlayGradient = () => {
    switch (overlayGradient) {
      case 'minimal':
        return 'radial-gradient(ellipse at center, rgba(3, 7, 18, 0.25) 0%, rgba(3, 7, 18, 0.65) 100%)';
      case 'strong':
        return 'linear-gradient(180deg, rgba(3, 7, 18, 0.8) 0%, rgba(3, 7, 18, 0.45) 40%, rgba(3, 7, 18, 0.85) 100%)';
      case 'none':
        return 'none';
      case 'standard':
      default:
        return 'linear-gradient(180deg, rgba(3, 7, 18, 0.6) 0%, rgba(3, 7, 18, 0.3) 30%, rgba(3, 7, 18, 0.35) 70%, rgba(3, 7, 18, 0.8) 100%)';
    }
  };

  const containerClasses = isFixed
    ? 'fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden'
    : `relative w-full overflow-hidden ${className}`;

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* High-res Space Image Layer */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-700 ease-out will-change-transform"
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundPosition: 'center center',
          transform: isFixed
            ? `translate3d(0, ${-offsetY * 0.2}px, 0) scale(1.08)`
            : `translate3d(0, ${offsetY}px, 0) scale(1.12)`,
          opacity: imageLoaded ? 1 : 0.85,
        }}
      />

      {/* Hidden preloader */}
      <img
        src={imageSrc}
        alt=""
        className="hidden"
        onLoad={() => setImageLoaded(true)}
      />

      {/* Atmospheric Space Overlay (Keeps text legible without muddying the realistic space photo) */}
      <div
        className={`absolute inset-0 pointer-events-none ${overlayClassName}`}
        style={{
          background: getOverlayGradient(),
        }}
      />

      {/* Subtle Space Particle Star Dust Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,7,18,0.7)_100%)]" />

      {/* Optional Children content */}
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
}
