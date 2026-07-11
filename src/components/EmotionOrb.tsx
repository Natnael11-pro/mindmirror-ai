// src/components/EmotionOrb.tsx
import { motion } from 'framer-motion';

interface EmotionOrbProps {
  emotion: string;
}

// Define emotion colors and properties
const emotionConfig: Record<string, { color: string; glow: string; label: string }> = {
  calm: { 
    color: 'bg-blue-400', 
    glow: 'shadow-blue-400/50',
    label: 'Calm'
  },
  sad: { 
    color: 'bg-indigo-400', 
    glow: 'shadow-indigo-400/50',
    label: 'Reflective'
  },
  anxious: { 
    color: 'bg-amber-400', 
    glow: 'shadow-amber-400/50',
    label: 'Anxious'
  },
  frustrated: { 
    color: 'bg-red-400', 
    glow: 'shadow-red-400/50',
    label: 'Frustrated'
  },
  happy: { 
    color: 'bg-green-400', 
    glow: 'shadow-green-400/50',
    label: 'Hopeful'
  },
  overwhelmed: { 
    color: 'bg-purple-400', 
    glow: 'shadow-purple-400/50',
    label: 'Overwhelmed'
  },
  neutral: { 
    color: 'bg-gray-400', 
    glow: 'shadow-gray-400/50',
    label: 'Neutral'
  }
};

export function EmotionOrb({ emotion }: EmotionOrbProps) {
  const config = emotionConfig[emotion.toLowerCase()] || emotionConfig.neutral;

  return (
    <div className="flex items-center gap-3">
      {/* The Glowing Orb */}
      <div className="relative">
        {/* Outer glow animation */}
        <motion.div
          className={`absolute inset-0 rounded-full ${config.color} opacity-30`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main orb */}
        <motion.div
          className={`w-4 h-4 rounded-full ${config.color} shadow-lg ${config.glow}`}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Emotion Label */}
      <span className="text-sm text-gray-400 capitalize">
        {config.label}
      </span>
    </div>
  );
}