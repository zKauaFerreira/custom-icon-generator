import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useLenis } from './LenisProvider';

export const BackToTopButton = () => {
  const lenis = useLenis();
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    // Lenis atualiza window.pageYOffset, então podemos usá-lo
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    if (lenis) {
      // Usa o método scrollTo do Lenis
      lenis.scrollTo(0, { duration: 0.5 });
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            onClick={scrollToTop}
            className="h-12 w-12 rounded-full shadow-lg animate-in fade-in-50 slide-in-from-bottom-10 duration-300"
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Voltar ao topo</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};