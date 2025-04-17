
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ChevronsLeft, 
  ChevronsRight, 
  X, 
  Play, 
  Pause,
  VolumeX,
  Volume2,
  BookOpen
} from 'lucide-react';
import { Book } from '@/store/useStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  getPDFTotalPages, 
  extractTextFromPDFPage, 
  textToSpeech, 
  PDFReadingState 
} from '@/services/aiService';

interface PDFReaderProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

const PDFReader: React.FC<PDFReaderProps> = ({ book, isOpen, onClose }) => {
  const [readingState, setReadingState] = useState<PDFReadingState>({
    currentPage: 1,
    totalPages: 0,
    isReading: false,
    currentText: '',
  });
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocumentRef = useRef<any>(null);
  
  // Initialize PDF reader when a book is opened
  useEffect(() => {
    if (book && isOpen) {
      const loadPDF = async () => {
        try {
          const url = book.readUrl;
          setPdfUrl(url);
          
          // Get total pages
          const totalPages = await getPDFTotalPages(url);
          
          setReadingState(prev => ({
            ...prev,
            totalPages,
            currentPage: 1,
            currentText: '',
            isReading: false
          }));
          
          // Load first page
          if (totalPages > 0) {
            await renderPage(1, url);
          }
        } catch (error) {
          console.error('Error loading PDF:', error);
        }
      };
      
      loadPDF();
    }
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [book, isOpen]);
  
  // Render a specific page of the PDF
  const renderPage = async (pageNumber: number, url = pdfUrl) => {
    try {
      // Get text from page for TTS
      const text = await extractTextFromPDFPage(url, pageNumber);
      
      setReadingState(prev => ({
        ...prev,
        currentPage: pageNumber,
        currentText: text
      }));
      
      // Load and render the PDF page in the canvas
      if (canvasRef.current) {
        const pdfjsLib = await import('pdfjs-dist');
        
        if (!pdfDocumentRef.current) {
          const loadingTask = pdfjsLib.getDocument(url);
          pdfDocumentRef.current = await loadingTask.promise;
        }
        
        const page = await pdfDocumentRef.current.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context!,
          viewport: viewport
        }).promise;
      }
    } catch (error) {
      console.error(`Error rendering page ${pageNumber}:`, error);
    }
  };
  
  // Change page
  const changePage = async (newPage: number) => {
    if (
      newPage >= 1 && 
      newPage <= readingState.totalPages && 
      newPage !== readingState.currentPage
    ) {
      // Stop any ongoing reading
      if (readingState.isReading) {
        stopReading();
      }
      
      await renderPage(newPage);
    }
  };
  
  // Toggle reading the current page aloud
  const toggleReading = async () => {
    if (readingState.isReading) {
      stopReading();
    } else {
      startReading();
    }
  };
  
  // Start reading current page
  const startReading = async () => {
    try {
      if (!readingState.currentText) {
        return;
      }
      
      setReadingState(prev => ({ ...prev, isReading: true }));
      
      // Convert text to speech using Google TTS API
      const audioBase64 = await textToSpeech(readingState.currentText);
      
      if (audioBase64) {
        // Create audio element
        if (!audioRef.current) {
          audioRef.current = new Audio();
          
          // Setup event listeners
          audioRef.current.onended = () => {
            if (readingState.currentPage < readingState.totalPages) {
              changePage(readingState.currentPage + 1).then(() => {
                if (readingState.isReading) {
                  startReading();
                }
              });
            } else {
              setReadingState(prev => ({ ...prev, isReading: false }));
            }
          };
        }
        
        // Set source and play
        audioRef.current.src = `data:audio/mp3;base64,${audioBase64}`;
        audioRef.current.muted = isMuted;
        
        try {
          await audioRef.current.play();
        } catch (e) {
          console.error('Error playing audio:', e);
          // If autoplay fails, we can offer a manual play button
        }
      } else {
        // If no audio content, try using browser's built-in TTS
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); // Cancel any ongoing speech
          const utterance = new SpeechSynthesisUtterance(readingState.currentText);
          utterance.lang = 'pt-BR';
          utterance.onend = () => {
            if (readingState.currentPage < readingState.totalPages) {
              changePage(readingState.currentPage + 1).then(() => {
                if (readingState.isReading) {
                  startReading();
                }
              });
            } else {
              setReadingState(prev => ({ ...prev, isReading: false }));
            }
          };
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error in reading aloud:', error);
      setReadingState(prev => ({ ...prev, isReading: false }));
    }
  };
  
  // Stop reading
  const stopReading = () => {
    setReadingState(prev => ({ ...prev, isReading: false }));
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };
  
  // Close PDF reader
  const handleClose = () => {
    stopReading();
    onClose();
  };
  
  if (!isOpen || !book) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="p-2 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4" />
          <h2 className="text-lg font-semibold truncate max-w-[200px] sm:max-w-md">
            {book.title}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* PDF Viewer */}
      <div className="flex flex-col flex-1 items-center justify-center overflow-hidden">
        <ScrollArea className="w-full h-full">
          <div className="flex justify-center p-2">
            <canvas 
              ref={canvasRef} 
              className="border border-border rounded max-w-full"
            ></canvas>
          </div>
        </ScrollArea>
      </div>
      
      {/* Controls */}
      <Card className="m-2 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => changePage(readingState.currentPage - 1)}
            disabled={readingState.currentPage <= 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">
            {readingState.currentPage} / {readingState.totalPages}
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => changePage(readingState.currentPage + 1)}
            disabled={readingState.currentPage >= readingState.totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          variant={readingState.isReading ? "destructive" : "default"}
          size="sm"
          onClick={toggleReading}
        >
          {readingState.isReading ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              Parar Leitura
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Ler em Voz Alta
            </>
          )}
        </Button>
      </Card>
    </div>
  );
};

export default PDFReader;
