import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { IconCard } from "@/components/IconCard";
import { MadeWithDyad } from "@/components/made-with-dyad";
import * as allSimpleIcons from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Bookmark, Search, Shuffle, Settings, X } from "lucide-react";
import { ColorPicker } from "@/components/ColorPicker";
import { Button } from "@/components/ui/button";
import { BatchDownloaderSheet } from "@/components/BatchDownloaderSheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BackToTopButton } from "@/components/BackToTopButton";
import { ResolutionDialog } from "@/components/ResolutionDialog";
import { useLocation } from "react-router-dom";
import { useLenis } from "@/components/LenisProvider";

export interface IconData {
  title: string;
  slug: string;
}

const iconList: IconData[] = Object.values(allSimpleIcons)
  .filter((icon): icon is SimpleIcon => 
    typeof icon === 'object' && icon !== null && 'title' in icon
  )
  .map(icon => ({
    title: icon.title,
    slug: icon.slug,
  }));

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

const ITEMS_PER_PAGE = 50;
const RESOLUTION_STORAGE_KEY = 'iconGeneratorResolution';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [color, setColor] = useState(getRandomColor());
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [shuffledIcons, setShuffledIcons] = useState<IconData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'random' | 'az' | 'za'>('random');
  const [selectedIcons, setSelectedIcons] = useState(new Set<string>());
  const [resolution, setResolution] = useState(() => {
    // Inicializa a resolução a partir do localStorage
    if (typeof window !== 'undefined') {
      const storedResolution = localStorage.getItem(RESOLUTION_STORAGE_KEY);
      if (storedResolution) {
        const parsedResolution = parseInt(storedResolution, 10);
        // Garante que o valor lido seja um número positivo
        if (!isNaN(parsedResolution) && parsedResolution > 0) {
          return parsedResolution;
        }
      }
    }
    return 256; // Fallback padrão
  });
  const [isResolutionDialogOpen, setIsResolutionDialogOpen] = useState(false);
  
  const location = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    try {
      const storedColors = localStorage.getItem("recentColors");
      if (storedColors) setRecentColors(JSON.parse(storedColors));
    } catch (error) {
      console.error("Failed to parse recent colors from localStorage", error);
      localStorage.removeItem("recentColors");
    }
    setShuffledIcons(shuffleArray(iconList));
  }, []);
  
  // Efeito para rolar para o topo em mudanças de rota
  useEffect(() => {
    if (lenis) {
      // Rola para o topo instantaneamente em mudanças de rota
      lenis.scrollTo(0, { immediate: true });
    }
  }, [location.pathname, lenis]);

  const updateRecentColors = (newColor: string) => {
    const updatedColors = [newColor, ...recentColors.filter((c) => c !== newColor)].slice(0, 10);
    setRecentColors(updatedColors);
    localStorage.setItem("recentColors", JSON.stringify(updatedColors));
  };
  
  const removeRecentColor = (colorToRemove: string) => {
    const updatedColors = recentColors.filter(c => c !== colorToRemove);
    setRecentColors(updatedColors);
    localStorage.setItem("recentColors", JSON.stringify(updatedColors));
  };

  const handleSelectIcon = (slug: string) => {
    setSelectedIcons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });
  };

  const handleResolutionChange = (newResolution: number) => {
    setResolution(newResolution);
    // Salva a nova resolução no localStorage
    localStorage.setItem(RESOLUTION_STORAGE_KEY, newResolution.toString());
  };

  const sortedIcons = useMemo(() => {
    const icons = [...shuffledIcons];
    if (sortBy === 'az') {
      return icons.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'za') {
      return icons.sort((a, b) => b.title.localeCompare(a.title));
    }
    return icons;
  }, [sortBy, shuffledIcons]);

  const filteredIcons = useMemo(() => {
    setCurrentPage(1);
    if (!searchQuery) return sortedIcons;
    return sortedIcons.filter((icon) =>
      icon.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, sortedIcons]);

  const pageCount = Math.ceil(filteredIcons.length / ITEMS_PER_PAGE);
  const paginatedIcons = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredIcons.slice(start, end);
  }, [filteredIcons, currentPage]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Gerador de Ícones Personalizados</h1>
        <p className="text-muted-foreground mt-2">
          Pesquise, selecione, personalize e baixe ícones no formato que precisar.
        </p>
      </header>

      <main>
        <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border mb-8 flex flex-col gap-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pesquisar ícones (ex: Spotify, Discord...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Controles: Esquerda (Cores), Centro (Resolução), Direita (Filtros) */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Esquerda: Cores e Ações */}
            <div className="flex items-center gap-2 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div><ColorPicker value={color} onChange={setColor} /></div>
                </TooltipTrigger>
                <TooltipContent><p>Selecionar Cor</p></TooltipContent>
              </Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => setColor(getRandomColor())}><Shuffle className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Cor Aleatória</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => updateRecentColors(color)}><Bookmark className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Salvar Cor</TooltipContent></Tooltip>
              
              <div className="flex gap-2 flex-wrap ml-2">
                {recentColors.map((recentColor) => (
                  <div key={recentColor} className="relative group">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: recentColor }}
                          onClick={() => setColor(recentColor)}
                          aria-label={`Select color ${recentColor}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent><p>Usar cor {recentColor}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => removeRecentColor(recentColor)}
                          className="absolute -top-1 -right-1 bg-card border rounded-full p-0.5 hidden group-hover:flex items-center justify-center"
                          aria-label={`Remove color ${recentColor}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p>Remover cor</p></TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Centro: Botão de Configuração de Resolução */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={() => setIsResolutionDialogOpen(true)} className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {resolution}x{resolution}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Configurar Resolução PNG/ICO</p></TooltipContent>
            </Tooltip>

            {/* Direita: Ordenação */}
            <ToggleGroup type="single" value={sortBy} onValueChange={(value) => value && setSortBy(value as any)}>
              <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="random" aria-label="Ordenar aleatoriamente"><Shuffle className="h-4 w-4" /></ToggleGroupItem></TooltipTrigger><TooltipContent>Aleatório</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="az" aria-label="Ordenar de A a Z" className="whitespace-nowrap">A-Z</ToggleGroupItem></ToggleGroupTrigger><TooltipContent>Ordem Alfabética</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><ToggleGroupItem value="za" aria-label="Ordenar de Z a A" className="whitespace-nowrap">Z-A</ToggleGroupItem></ToggleGroupTrigger><TooltipContent>Ordem Alfabética Inversa</TooltipContent></ToggleGroup>
            </ToggleGroup>
          </div>
        </div>

        {paginatedIcons.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {paginatedIcons.map((icon) => (
                <IconCard 
                  key={icon.slug} 
                  icon={icon} 
                  color={color} 
                  resolution={resolution} // Passando a resolução
                  isSelected={selectedIcons.has(icon.slug)}
                  onSelect={handleSelectIcon}
                />
              ))}
            </div>
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(p - 1, 1)); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                    </TooltipTrigger>
                    <TooltipContent><p>Página Anterior</p></TooltipContent>
                  </Tooltip>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2 text-sm font-medium">Página {currentPage} de {pageCount}</span>
                </PaginationItem>
                <PaginationItem>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(p + 1, pageCount)); }} className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""} />
                    </TooltipTrigger>
                    <TooltipContent><p>Próxima Página</p></TooltipContent>
                  </Tooltip>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhum ícone encontrado para "{searchQuery}".</p>
          </div>
        )}
      </main>

      <BatchDownloaderSheet
        selectedIcons={selectedIcons}
        allIcons={iconList}
        color={color}
        resolution={resolution} // Passando a resolução
        onClear={() => setSelectedIcons(new Set())}
        onRemoveIcon={handleSelectIcon}
      />
      
      <BackToTopButton />

      <MadeWithDyad />

      <ResolutionDialog
        open={isResolutionDialogOpen}
        onOpenChange={setIsResolutionDialogOpen}
        currentResolution={resolution}
        onResolutionChange={handleResolutionChange} // Usando a nova função
      />
    </div>
  );
};

export default Index;