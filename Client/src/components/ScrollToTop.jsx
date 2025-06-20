import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300 && !isLaunching) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const handleScrollToTop = () => {
    setIsLaunching(true);
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    setTimeout(() => {
      setIsLaunching(false);
      setIsVisible(false);
    }, 1000);
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [isLaunching]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-8 right-8 z-50 ">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={handleScrollToTop}
            className="cursor-pointer"
          >
            <motion.div
              animate={isLaunching ? {
                y: -window.pageYOffset - 100,
                opacity: 0,
                transition: { 
                  duration: 0.8,
                  ease: [0.2, 0.8, 0.2, 1]
                }
              } : {}}
              whileHover={{ rotate: -20, scale: 1.2 }}
            >
              <Rocket className="h-12 w-12 text-blue-600 drop-shadow-lg" />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;