
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Download, BookOpen, Star, Play, Share2 } from 'lucide-react';
import { Book } from '@/store/useStore';
import useStore from '@/store/useStore';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

interface BookCardProps {
  book: Book;
  onReadClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onReadClick }) => {
  const { 
    favorites, 
    addToFavorites, 
    removeFromFavorites,
    readingHistory,
    playlists,
    addToPlaylist,
    createPlaylist
  } = useStore();

  const isFavorite = favorites.includes(book.id);
  
  // Encontra o progresso de leitura deste livro
  const readingProgress = readingHistory.find(p => p.bookId === book.id);
  const progress = readingProgress?.progress || 0;

  // Extrai o valor numérico da classificação (assumindo formato "Peso: X 🔥")
  const ratingMatch = book.rating.match(/\d+/);
  const ratingValue = ratingMatch ? parseInt(ratingMatch[0], 10) : 5;
  
  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFromFavorites(book.id);
      toast({
        title: "Removido dos favoritos",
        description: `"${book.title}" foi removido da sua lista de favoritos.`
      });
    } else {
      addToFavorites(book.id);
      toast({
        title: "Adicionado aos favoritos",
        description: `"${book.title}" foi adicionado à sua lista de favoritos.`
      });
    }
  };
  
  const handleAddToPlaylist = (playlistId: string) => {
    addToPlaylist(playlistId, book.id);
    toast({
      title: "Adicionado à playlist",
      description: `"${book.title}" foi adicionado à playlist.`
    });
  };
  
  const handleCreateNewPlaylist = () => {
    const playlistName = prompt("Nome da nova playlist:");
    if (playlistName) {
      createPlaylist(playlistName);
      // Adiciona à playlist recém-criada
      // (não é o mais eficiente, mas funciona para essa demonstração)
      setTimeout(() => {
        const newPlaylist = playlists[playlists.length - 1];
        if (newPlaylist) {
          handleAddToPlaylist(newPlaylist.id);
        }
      }, 100);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: book.synopsis,
        url: book.readUrl,
      })
      .catch((error) => console.log('Erro ao compartilhar', error));
    } else {
      // Fallback para cópia do link
      navigator.clipboard.writeText(book.readUrl);
      toast({
        title: "Link copiado",
        description: "O link do livro foi copiado para a área de transferência."
      });
    }
  };

  const handleDownload = () => {
    window.open(book.downloadUrl, '_blank');
  };

  return (
    <Card className={cn(
      "law-card overflow-hidden h-full flex flex-col transition-all hover:translate-y-[-5px]",
      progress > 0 && "border-l-4 border-l-blue-500"
    )}>
      <div className="relative w-full pt-[140%] overflow-hidden bg-muted">
        <img 
          src={book.coverUrl} 
          alt={book.title}
          className="absolute inset-0 object-cover w-full h-full transition-transform hover:scale-105"
          onClick={() => onReadClick(book)}
        />
        {isFavorite && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="gold-accent">
              <Star className="h-3 w-3 mr-1 text-law-gold" /> Favorito
            </Badge>
          </div>
        )}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold line-clamp-2 mb-2">{book.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{book.synopsis}</p>
        
        <div className="flex items-center gap-2 mt-auto">
          <Badge variant="outline" className="text-muted-foreground">
            {book.category}
          </Badge>
          <Badge variant="secondary" className="ml-auto">
            {Array(Math.min(5, ratingValue)).fill(0).map((_, i) => (
              <Star key={i} className="h-3 w-3 inline fill-current" />
            ))}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2 flex flex-wrap">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1"
          onClick={() => onReadClick(book)}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Ler
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleFavoriteToggle}>
              <Star className="h-4 w-4 mr-2" />
              {isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleCreateNewPlaylist}>
              <Play className="h-4 w-4 mr-2" />
              Criar nova playlist
            </DropdownMenuItem>
            
            {playlists.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold">Adicionar à playlist</div>
                {playlists.map(playlist => (
                  <DropdownMenuItem 
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                  >
                    {playlist.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        
        {book.downloadUrl && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookCard;
