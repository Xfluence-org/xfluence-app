import React, { useEffect, useState } from 'react';
import { Sparkles, Shirt, Cpu, Dumbbell, Plane, UtensilsCrossed, Gamepad2, Music, Heart, Star } from 'lucide-react';

interface CampaignAcceptanceAnimationProps {
  category: string;
  onComplete?: () => void;
}

const CampaignAcceptanceAnimation: React.FC<CampaignAcceptanceAnimationProps> = ({ 
  category, 
  onComplete 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getCategoryAnimation = () => {
    const categoryLower = category.toLowerCase();
    
    switch (categoryLower) {
      case 'beauty':
        return {
          icon: Sparkles,
          animation: 'animate-beauty-sparkle',
          color: 'text-pink-500',
          bgColor: 'bg-gradient-to-br from-pink-100 to-purple-100',
          particles: Array(12).fill(null).map((_, i) => ({
            delay: i * 0.1,
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
          }))
        };
      
      case 'fashion':
        return {
          icon: Shirt,
          animation: 'animate-fashion-strut',
          color: 'text-purple-500',
          bgColor: 'bg-gradient-to-br from-purple-100 to-indigo-100',
          particles: Array(8).fill(null).map((_, i) => ({
            delay: i * 0.15,
            x: i % 2 === 0 ? -50 : 50,
            y: -i * 20,
          }))
        };
      
      case 'tech':
      case 'technology':
        return {
          icon: Cpu,
          animation: 'animate-tech-circuit',
          color: 'text-blue-500',
          bgColor: 'bg-gradient-to-br from-blue-100 to-cyan-100',
          particles: Array(10).fill(null).map((_, i) => ({
            delay: i * 0.1,
            x: Math.cos(i * 36 * Math.PI / 180) * 100,
            y: Math.sin(i * 36 * Math.PI / 180) * 100,
          }))
        };
      
      case 'fitness':
      case 'health':
        return {
          icon: Dumbbell,
          animation: 'animate-fitness-pulse',
          color: 'text-green-500',
          bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
          particles: Array(3).fill(null).map((_, i) => ({
            delay: i * 0.5,
            scale: 1 + i * 0.2,
          }))
        };
      
      case 'travel':
        return {
          icon: Plane,
          animation: 'animate-travel-fly',
          color: 'text-sky-500',
          bgColor: 'bg-gradient-to-br from-sky-100 to-blue-100',
          particles: Array(1).fill(null).map(() => ({
            path: true,
          }))
        };
      
      case 'food':
      case 'cooking':
        return {
          icon: UtensilsCrossed,
          animation: 'animate-food-sizzle',
          color: 'text-orange-500',
          bgColor: 'bg-gradient-to-br from-orange-100 to-red-100',
          particles: Array(6).fill(null).map((_, i) => ({
            delay: i * 0.2,
            y: -Math.random() * 50,
          }))
        };
      
      case 'gaming':
        return {
          icon: Gamepad2,
          animation: 'animate-gaming-powerup',
          color: 'text-purple-500',
          bgColor: 'bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100',
          particles: Array(1).fill(null).map(() => ({
            rainbow: true,
          }))
        };
      
      case 'music':
        return {
          icon: Music,
          animation: 'animate-music-wave',
          color: 'text-pink-500',
          bgColor: 'bg-gradient-to-br from-pink-100 to-purple-100',
          particles: Array(5).fill(null).map((_, i) => ({
            delay: i * 0.1,
            height: 20 + Math.random() * 60,
          }))
        };
      
      case 'lifestyle':
        return {
          icon: Heart,
          animation: 'animate-lifestyle-bloom',
          color: 'text-red-500',
          bgColor: 'bg-gradient-to-br from-red-100 to-pink-100',
          particles: Array(8).fill(null).map((_, i) => ({
            delay: i * 0.125,
            angle: i * 45,
          }))
        };
      
      default:
        return {
          icon: Star,
          animation: 'animate-default-celebration',
          color: 'text-yellow-500',
          bgColor: 'bg-gradient-to-br from-yellow-100 to-amber-100',
          particles: Array(10).fill(null).map((_, i) => ({
            delay: i * 0.1,
            angle: i * 36,
          }))
        };
    }
  };

  if (!isVisible) return null;

  const { icon: Icon, animation, color, bgColor, particles } = getCategoryAnimation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      <div className="relative">
        {/* Background circle */}
        <div className={`absolute inset-0 w-64 h-64 ${bgColor} rounded-full blur-3xl opacity-50 animate-pulse`} />
        
        {/* Main icon */}
        <div className={`relative z-10 ${animation}`}>
          <Icon className={`w-32 h-32 ${color}`} />
        </div>
        
        {/* Particles */}
        {particles.map((particle, index) => (
          <div
            key={index}
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: `translate(-50%, -50%)`,
              animationDelay: `${particle.delay}s`,
            }}
          >
            {particle.path && (
              <Plane className={`w-8 h-8 ${color} animate-travel-fly`} />
            )}
            {particle.rainbow && (
              <div className="w-24 h-24 rounded-full animate-gaming-powerup">
                <div className="w-full h-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-full opacity-50" />
              </div>
            )}
            {particle.height && (
              <div 
                className={`w-4 ${bgColor} animate-music-wave`}
                style={{ height: `${particle.height}px` }}
              />
            )}
            {particle.scale && (
              <div 
                className={`absolute w-32 h-32 rounded-full border-4 ${color} animate-fitness-pulse`}
                style={{ 
                  transform: `translate(-50%, -50%) scale(${particle.scale})`,
                  borderColor: 'currentColor',
                  opacity: 0.3,
                }}
              />
            )}
            {particle.x !== undefined && particle.y !== undefined && !particle.path && !particle.height && !particle.scale && (
              <Sparkles 
                className={`w-6 h-6 ${color} animate-beauty-sparkle`}
                style={{
                  transform: `translate(${particle.x}px, ${particle.y}px)`,
                }}
              />
            )}
            {particle.angle !== undefined && (
              <div
                className="absolute"
                style={{
                  transform: `rotate(${particle.angle}deg) translateY(-100px)`,
                }}
              >
                <Heart className={`w-8 h-8 ${color} animate-lifestyle-bloom`} />
              </div>
            )}
          </div>
        ))}
        
        {/* Success message */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to the Campaign!</h3>
          <p className="text-gray-600">Get ready for an amazing {category} journey</p>
        </div>
      </div>
    </div>
  );
};

export default CampaignAcceptanceAnimation;