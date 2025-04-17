
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Header from '@/components/Layout/Header';
import Sidebar from '@/components/Layout/Sidebar';
import CategoryHeader from '@/components/Book/CategoryHeader';
import BookGrid from '@/components/Book/BookGrid';
import CategoryList from '@/components/Book/CategoryList';
import BookFilters from '@/components/Book/BookFilters';
import BookReader from '@/components/Book/BookReader';
import useStore from '@/store/useStore';
import { Book } from '@/store/useStore';
import { fetchBooks } from '@/services/googleSheetsService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, BookOpenCheck, Bookmark, History } from 'lucide-react';

const Index = () => {
  const { 
    books, 
    setBooks,
    categories,
    setCategories,
    selectedCategory,
    setSelectedCategory,
    favorites,
    readingHistory,
    searchQuery,
    sortBy,
    isReaderOpen,
    setReaderOpen,
    currentBook,
    setCurrentBook
  } = useStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'history'>('all');
  const [viewMode, setViewMode] = useState<'categories' | 'books'>(!selectedCategory ? 'categories' : 'books');
  
  // Carrega os livros e categorias ao iniciar
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true);
        const data = await fetchBooks();
        setBooks(data.books);
        setCategories(data.categories);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao carregar livros:', err);
        setError('Não foi possível carregar os livros. Por favor, tente novamente mais tarde.');
        setIsLoading(false);
      }
    };
    
    loadBooks();
  }, [setBooks, setCategories]);
  
  // Atualiza o modo de visualização com base na categoria selecionada
  useEffect(() => {
    if (selectedCategory) {
      setViewMode('books');
    }
  }, [selectedCategory]);
  
  // Função para filtrar e ordenar os livros com base nos filtros atuais
  const getFilteredBooks = (): Book[] => {
    let filteredBooks = [...books];
    
    // Filtro por categoria
    if (selectedCategory) {
      filteredBooks = filteredBooks.filter(book => book.category === selectedCategory);
    }
    
    // Filtro por pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.synopsis.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
      );
    }
    
    // Filtro por favoritos ou histórico
    if (activeFilter === 'favorites') {
      filteredBooks = filteredBooks.filter(book => favorites.includes(book.id));
    } else if (activeFilter === 'history') {
      const historyIds = readingHistory.map(item => item.bookId);
      filteredBooks = filteredBooks.filter(book => historyIds.includes(book.id));
      
      // Ordena por mais recente no histórico
      filteredBooks.sort((a, b) => {
        const aProgress = readingHistory.find(p => p.bookId === a.id);
        const bProgress = readingHistory.find(p => p.bookId === b.id);
        
        if (!aProgress?.lastRead || !bProgress?.lastRead) return 0;
        
        return new Date(bProgress.lastRead).getTime() - new Date(aProgress.lastRead).getTime();
      });
      
      return filteredBooks;
    }
    
    // Ordenação
    switch (sortBy) {
      case 'name':
        filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        filteredBooks.sort((a, b) => {
          const aRating = parseInt(a.rating.match(/\d+/)?.[0] || '0', 10);
          const bRating = parseInt(b.rating.match(/\d+/)?.[0] || '0', 10);
          return bRating - aRating;
        });
        break;
      case 'mostAccessed':
        // Simulação - em uma implementação real, teríamos um contador de acessos
        // Aqui usamos o progresso como um indicador
        filteredBooks.sort((a, b) => {
          const aProgress = readingHistory.find(p => p.bookId === a.id)?.progress || 0;
          const bProgress = readingHistory.find(p => p.bookId === b.id)?.progress || 0;
          return bProgress - aProgress;
        });
        break;
      case 'order':
      default:
        filteredBooks.sort((a, b) => a.order - b.order);
        break;
    }
    
    return filteredBooks;
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setViewMode('books');
  };
  
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setViewMode('categories');
  };
  
  const handleBookSelect = (book: Book) => {
    setCurrentBook(book);
    setReaderOpen(true);
  };
  
  const handleReaderClose = () => {
    setReaderOpen(false);
    setCurrentBook(null);
  };
  
  const filteredBooks = getFilteredBooks();
  const categoryBooks = selectedCategory 
    ? books.filter(book => book.category === selectedCategory)
    : [];
  const categoryCoverUrl = categoryBooks.length > 0 ? categoryBooks[0].coverUrl : undefined;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar para telas maiores */}
        <Sidebar />
        
        {/* Sidebar móvel */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-full sm:max-w-sm">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
        
        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4 mx-auto"></div>
                  <h2 className="text-xl font-semibold mb-2">Carregando biblioteca...</h2>
                  <p className="text-muted-foreground">Aguarde enquanto buscamos os livros</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="rounded-full bg-destructive/10 p-6 mb-4">
                  <svg
                    className="h-10 w-10 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {error}
                </p>
              </div>
            ) : viewMode === 'categories' ? (
              <>
                <h1 className="text-3xl font-bold mb-6">Biblioteca Jurídica</h1>
                <p className="text-muted-foreground mb-8 max-w-2xl">
                  Bem-vindo à Biblioteca Jurídica Interativa. Selecione uma das matérias abaixo para explorar os livros disponíveis ou utilize a pesquisa para encontrar conteúdos específicos.
                </p>
                
                <Tabs defaultValue="subjects" className="mb-8">
                  <TabsList>
                    <TabsTrigger value="subjects">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Matérias
                    </TabsTrigger>
                    <TabsTrigger value="favorites">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Favoritos
                    </TabsTrigger>
                    <TabsTrigger value="reading">
                      <BookOpenCheck className="h-4 w-4 mr-2" />
                      Em Leitura
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <History className="h-4 w-4 mr-2" />
                      Histórico
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="subjects" className="mt-6">
                    <CategoryList onCategorySelect={handleCategorySelect} />
                  </TabsContent>
                  
                  <TabsContent value="favorites" className="mt-6">
                    <BookGrid 
                      books={books.filter(book => favorites.includes(book.id))}
                      onBookSelect={handleBookSelect}
                    />
                  </TabsContent>
                  
                  <TabsContent value="reading" className="mt-6">
                    <BookGrid 
                      books={books.filter(book => {
                        const progress = readingHistory.find(p => p.bookId === book.id)?.progress || 0;
                        return progress > 0 && progress < 100;
                      })}
                      onBookSelect={handleBookSelect}
                    />
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-6">
                    <BookGrid 
                      books={books.filter(book => 
                        readingHistory.some(history => history.bookId === book.id)
                      ).sort((a, b) => {
                        const aDate = readingHistory.find(h => h.bookId === a.id)?.lastRead || new Date(0);
                        const bDate = readingHistory.find(h => h.bookId === b.id)?.lastRead || new Date(0);
                        return new Date(bDate).getTime() - new Date(aDate).getTime();
                      })}
                      onBookSelect={handleBookSelect}
                    />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <>
                {selectedCategory && (
                  <CategoryHeader 
                    category={selectedCategory}
                    bookCount={categoryBooks.length}
                    coverUrl={categoryCoverUrl}
                  />
                )}
                
                <BookFilters 
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />
                
                <BookGrid 
                  books={filteredBooks}
                  onBookSelect={handleBookSelect}
                  className="mb-12"
                />
              </>
            )}
          </div>
        </main>
      </div>
      
      {/* Leitor de Livros */}
      <BookReader 
        book={currentBook}
        isOpen={isReaderOpen}
        onClose={handleReaderClose}
      />
    </div>
  );
};

export default Index;
