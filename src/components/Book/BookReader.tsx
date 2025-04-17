
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Book as BookType } from '@/store/useStore';
import useStore from '@/store/useStore';
import { 
  X, 
  Download, 
  Share2, 
  Bookmark, 
  Star, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { explainAndSpeak, textToSpeech } from '@/services/aiService';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface BookReaderProps {
  book: BookType | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({ book, isOpen, onClose }) => {
  const { 
    updateReadingProgress,
    readingHistory,
    favorites,
    addToFavorites,
    removeFromFavorites,
    fontSize
  } = useStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Simula o progresso para esta demonstração
  const progress = readingHistory.find(p => p?.bookId === book?.id)?.progress || 0;
  
  const isFavorite = book ? favorites.includes(book.id) : false;

  // Função para lidar com o fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erro ao tentar entrar em tela cheia: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Atualiza o progresso ao fechar
  const handleClose = () => {
    if (book) {
      // Simula um progresso aleatório para demonstração
      // Em uma implementação real, usaríamos uma rastreamento real do progresso
      const randomProgress = Math.min(progress + Math.floor(Math.random() * 10), 100);
      updateReadingProgress(book.id, randomProgress);
    }
    onClose();
  };

  const handleFavoriteToggle = () => {
    if (!book) return;
    
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

  const handleShare = () => {
    if (!book) return;
    
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
    if (book?.downloadUrl) {
      window.open(book.downloadUrl, '_blank');
    }
  };

  const handleAIExplain = async () => {
    if (!book) return;
    
    setIsExplaining(true);
    try {
      // Fix here: extract just the text part from the response
      const result = await explainAndSpeak(book.title, book.synopsis);
      setExplanation(result.text); // Use only the text property from the return value
    } catch (error) {
      console.error('Erro ao explicar livro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a explicação do livro.",
        variant: "destructive"
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const toggleReading = async () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }
    
    if (!book) return;
    
    try {
      setIsReading(true);
      // Em uma implementação real, teríamos que extrair o texto do livro
      // Para demonstração, usamos a sinopse
      await textToSpeech(book.synopsis);
    } catch (error) {
      console.error('Erro na leitura em voz alta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a leitura em voz alta.",
        variant: "destructive"
      });
    } finally {
      setIsReading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
  };

  const handleIframeLoad = () => {
    setIsIframeLoaded(true);
  };

  // Limpa o estado quando fechar
  useEffect(() => {
    if (!isOpen) {
      setExplanation("");
      setIsIframeLoaded(false);
    }
  }, [isOpen]);

  // Monitora mudanças no fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={cn(
        "max-w-6xl w-full p-0 h-[90vh] flex flex-col",
        isFullscreen && "!max-w-none !h-screen !rounded-none"
      )}>
        <DialogHeader className="p-4 flex-shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl">{book?.title}</DialogTitle>
            <Badge variant="outline" className="ml-2">
              {book?.category}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleFavoriteToggle}
              className={isFavorite ? "text-law-gold" : ""}
            >
              <Star className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            
            {book?.downloadUrl && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleDownload}
              >
                <Download className="h-5 w-5" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            {!isIframeLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4 mx-auto"></div>
                  <p>Carregando documento...</p>
                </div>
              </div>
            )}
            
            <div className="flex-1 relative">
              <iframe 
                src={book?.readUrl} 
                className={cn(
                  "w-full h-full border-0",
                  !isIframeLoaded && "hidden"
                )}
                title={book?.title}
                onLoad={handleIframeLoad}
              />
            </div>
            
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleReading}
                  >
                    {isReading ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar Leitura
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Ler em Voz Alta
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleAIExplain}
                    disabled={isExplaining}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    IA Explica
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span>Progresso:</span>
                  <span className="ml-auto">{progress}%</span>
                </div>
                <Slider 
                  value={[progress]} 
                  max={100} 
                  step={1}
                  disabled
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {explanation && (
            <div className="w-80 border-l p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Explicação da IA
              </h3>
              <div className="text-sm space-y-4">
                {explanation.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookReader;
