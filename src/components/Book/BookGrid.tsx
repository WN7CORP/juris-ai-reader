
import React from 'react';
import { Book } from '@/store/useStore';
import BookCard from './BookCard';
import { cn } from '@/lib/utils';

interface BookGridProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
  className?: string;
}

const BookGrid: React.FC<BookGridProps> = ({ books, onBookSelect, className }) => {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-muted p-6 mb-4">
          <svg
            className="h-10 w-10 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum livro encontrado</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Não foram encontrados livros para exibir. Tente ajustar os filtros ou buscar por outra categoria.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", className)}>
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onReadClick={onBookSelect}
        />
      ))}
    </div>
  );
};

export default BookGrid;
