import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLenis } from "@/components/LenisProvider";

const NotFound = () => {
  const location = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
    
    // Rola para o topo ao carregar a página
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [location.pathname, lenis]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-gray-600 dark:text-muted-foreground mb-4">Oops! Página não encontrada</p>
        <a href="/" className="text-primary hover:text-primary/80 underline">
          Voltar para a Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;