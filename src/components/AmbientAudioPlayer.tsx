import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

// Royalty-free ambient soundscape URL (cosmic/ethereal)
const AMBIENT_AUDIO_URL = 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3';

interface AmbientAudioPlayerProps {
  className?: string;
}

const AmbientAudioPlayer = ({ className = '' }: AmbientAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(AMBIENT_AUDIO_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    audioRef.current.addEventListener('canplaythrough', () => {
      setIsLoaded(true);
    });

    // Hide tooltip after 5 seconds
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      clearTimeout(tooltipTimer);
    };
  }, []);

  const toggleAudio = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        setShowTooltip(false);
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  return (
    <div className={`fixed bottom-8 right-8 z-50 ${className}`}>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div className="bg-background/90 backdrop-blur-sm border border-border/50 px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm text-muted-foreground">
                Enable ambient soundscape
              </p>
            </div>
            {/* Arrow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="border-8 border-transparent border-l-border/50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio toggle button */}
      <motion.button
        onClick={toggleAudio}
        disabled={!isLoaded}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative w-14 h-14 rounded-full
          bg-background/80 backdrop-blur-md
          border border-border/50 hover:border-primary/50
          shadow-lg hover:shadow-primary/20
          flex items-center justify-center
          transition-all duration-300
          ${!isLoaded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isPlaying ? 'border-primary/60' : ''}
        `}
        aria-label={isPlaying ? 'Mute ambient audio' : 'Play ambient audio'}
      >
        {/* Glow effect when playing */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* Sound wave animation when playing */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-full h-full rounded-full border border-primary/30"
                animate={{
                  scale: [1, 1.5 + i * 0.3],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>
        )}

        <motion.div
          animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
          className="relative z-10"
        >
          {isPlaying ? (
            <Volume2 className="w-6 h-6 text-primary" />
          ) : (
            <VolumeX className="w-6 h-6 text-muted-foreground" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default AmbientAudioPlayer;
