import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { IconCard } from "@/components/IconCard";
import { ColorSelector } from "@/components/ColorSelector";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { showError } from "@/utils/toast";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Definindo a estrutura de dados para um ícone
export interface IconData {
  title: string;
  slug: string;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [color, setColor] = useState("#4287f5"); // Cor inicial azul
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [allIcons, setAllIcons] = useState<IconData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega as cores recentes do localStorage ao iniciar
  useEffect(() => {
    try {
      const storedColors = localStorage.getItem("recentColors");
      if (storedColors) {
        setRecentColors(JSON.parse(storedColors));
      }
    } catch (error) {
      console.error("Failed to parse recent colors from localStorage", error);
      localStorage.removeItem("recentColors");
    }
  }, []);

  // Busca a lista de ícones da API do Simple Icons ao carregar a página
  useEffect(() => {
    const fetchIcons = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://cdn.simpleicons.org/icons.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const iconList = data.icons.map((icon: any) => ({
          title: icon.title,
          slug: icon.slug,
        }));
        setAllIcons(iconList);
      } catch (error) {
        console.error("Failed to fetch icon list", error);
        showError("Não foi possível carregar a lista de ícones.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIcons();
  }, []);

  // Atualiza e salva as cores recentes no localStorage
  const updateRecentColors = (newColor: string) => {
    const updatedColors = [
      newColor,
      ...recentColors.filter((c) => c !== newColor),
    ].slice(0, 10); // Mantém apenas as 10 cores mais recentes

    setRecentColors(updatedColors);
    localStorage.setItem("recentColors", JSON.stringify(updatedColors));
  };

  // Filtra os ícones com base na busca do usuário
  const filteredIcons = useMemo(() => {
    if (!searchQuery) {
      return allIcons;
    }
    return allIcons.filter((icon) =>
      icon.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allIcons]);

  const renderLoadingSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 20 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="flex justify-center items-center p-6">
            <Skeleton className="h-16 w-16" />
          </CardContent>
          <CardFooter className="flex justify-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Gerador de Ícones Personalizados</h1>
        <p className="text-muted-foreground mt-2">
          Pesquise um ícone, escolha uma cor e baixe no formato que precisar.
        </p>
      </header>

      <main>
        <div className="flex flex-col md:flex-row gap-6 mb-8 sticky top-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Pesquisar ícones (ex: Spotify, Discord...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <ColorSelector
            color={color}
            setColor={setColor}
            recentColors={recentColors}
          />
        </div>

        {isLoading ? (
          renderLoadingSkeletons()
        ) : filteredIcons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredIcons.map((icon) => (
              <IconCard
                key={icon.slug}
                icon={icon}
                color={color}
                onColorUse={updateRecentColors}
              />
            ))}
          </div>
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