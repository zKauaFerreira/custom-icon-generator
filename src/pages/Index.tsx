import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { IconCard } from "@/components/IconCard";
import { ColorSelector } from "@/components/ColorSelector";
import { MadeWithDyad } from "@/components/made-with-dyad";
import * as allSimpleIcons from 'simple-icons';
import { ThemeToggle } from "@/components/theme-toggle";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Shuffle } from "lucide-react";

export interface IconData {
  title: string;
  slug: string;
}

const iconList: IconData[] = Object.values(allSimpleIcons).map(icon => ({
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

const ITEMS_PER_PAGE = 50;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [color, setColor] = useState("#4287f5");
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [shuffledIcons, setShuffledIcons] = useState<IconData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'random' | 'az' | 'za'>('random');

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

  const updateRecentColors = (newColor: string) => {
    const updatedColors = [newColor, ...recentColors.filter((c) => c !== newColor)].slice(0, 10);
    setRecentColors(updatedColors);
    localStorage.setItem("recentColors", JSON.stringify(updatedColors));
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
      <header className="text-center mb-8 relative">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Gerador de Ícones Personalizados</h1>
        <p className="text-muted-foreground mt-2">
          Pesquise um ícone, escolha uma cor e baixe no formato que precisar.
        </p>
      </header>

      <main>
        <div className="flex flex-col md:flex-row gap-6 mb-8 sticky top-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-lg border items-center">
          <div className="flex-grow w-full">
            <Input
              type="text"
              placeholder="Pesquisar ícones (ex: Spotify, Discord...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label>Ordenar</Label>
            <ToggleGroup type="single" value={sortBy} onValueChange={(value) => value && setSortBy(value as any)}>
              <ToggleGroupItem value="random" aria-label="Ordenar aleatoriamente"><Shuffle className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="az" aria-label="Ordenar de A a Z">A-Z</ToggleGroupItem>
              <ToggleGroupItem value="za" aria-label="Ordenar de Z a A">Z-A</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <ColorSelector color={color} setColor={setColor} recentColors={recentColors} />
        </div>

        {paginatedIcons.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {paginatedIcons.map((icon) => (
                <IconCard key={icon.slug} icon={icon} color={color} onColorUse={updateRecentColors} />
              ))}
            </div>
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(p - 1, 1)); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 py-2 text-sm font-medium">Página {currentPage} de {pageCount}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(p + 1, pageCount)); }} className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""} />
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
      <MadeWithDyad />
    </div>
  );
};

export default Index;