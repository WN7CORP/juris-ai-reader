
import React from 'react';
import { Book, Bookmark, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CategoryHeaderProps {
  category: string;
  bookCount: number;
  coverUrl?: string;
  className?: string;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  bookCount,
  coverUrl,
  className
}) => {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg mb-8 bg-muted",
      className
    )}>
      {/* Imagem de fundo (opcional, usa a capa do primeiro livro da categoria) */}
      {coverUrl && (
        <div className="absolute inset-0 opacity-20">
          <img 
            src={coverUrl} 
            alt="" 
            className="w-full h-full object-cover filter blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>
      )}
      
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Book className="h-6 w-6 text-law-gold" />
            {category}
          </h2>
          
          <p className="text-muted-foreground mt-2 max-w-xl">
            Explore {bookCount} {bookCount === 1 ? 'livro' : 'livros'} de {category}. 
            Clique nas capas para começar a ler ou utilizar os recursos disponíveis.
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Informações sobre {category}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="default">
            <Bookmark className="h-4 w-4 mr-2" />
            Adicionar categoria aos favoritos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;
