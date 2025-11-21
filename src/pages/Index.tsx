import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { IconCard } from "@/components/IconCard";
import { ColorSelector } from "@/components/ColorSelector";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { icons as allSimpleIcons } from 'simple-icons';

// Definindo a estrutura de dados para um ícone
export interface IconData {
  title: string;
  slug: string;
}

// Mapeia os ícones do pacote para o formato que precisamos, uma única vez.
const iconList: IconData[] = Object.values(allSimpleIcons).map(icon => ({
  title: icon.title,
  slug: icon.slug,
}));

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [color, setColor] = useState("#4287f5"); // Cor inicial azul
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Carrega as cores recentes do localStorage ao iniciar
  useEffect(() => {
    try {
      const storedColors = localStorage.getItem("recentColors");
      if (storedColors) {
        setRecentColors(JSON.parse(storedColors));
      }
    } catch (error)
      console.error("Failed to parse recent colors from localStorage", error);
      localStorage.removeItem("recentColors");
    }
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
      return iconList;
    }
    return iconList.filter((icon) =>
      icon.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
            />
          </div>
          <ColorSelector
            color={color}
            setColor={setColor}
            recentColors={recentColors}
          />
        </div>

        {filteredIcons.length > 0 ? (
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