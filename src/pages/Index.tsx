
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Header from '@/components/Layout/Header';
import Sidebar from '@/components/Layout/Sidebar';
import BookGrid from '@/components/Book/BookGrid';
import useStore from '@/store/useStore';
import { Book } from '@/store/useStore';
import PDFReader from '@/components/Book/PDFReader';

const Index = () => {
  const { 
    books, 
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    isReaderOpen,
    setReaderOpen,
    currentBook,
    setCurrentBook
  } = useStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set loading state based on books
  useEffect(() => {
    setIsLoading(books.length === 0);
  }, [books]);
  
  // Filter books based on search and category
  const getFilteredBooks = (): Book[] => {
    let filteredBooks = [...books];
    
    // Filter by category
    if (selectedCategory) {
      filteredBooks = filteredBooks.filter(book => book.category === selectedCategory);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.synopsis.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
      );
    }
    
    // Default sort by order
    filteredBooks.sort((a, b) => a.order - b.order);
    
    return filteredBooks;
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for larger screens */}
        <Sidebar />
        
        {/* Mobile sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-full sm:max-w-sm">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3 mx-auto"></div>
                  <h2 className="text-xl font-semibold mb-2">Carregando biblioteca...</h2>
                  <p className="text-muted-foreground">Aguarde enquanto buscamos os livros</p>
                </div>
              </div>
            ) : (
              <BookGrid 
                books={filteredBooks}
                onBookSelect={handleBookSelect}
                className="mb-6"
              />
            )}
          </div>
        </main>
      </div>
      
      {/* PDF Reader */}
      <PDFReader 
        book={currentBook}
        isOpen={isReaderOpen}
        onClose={handleReaderClose}
      />
    </div>
  );
};

export default Index;
