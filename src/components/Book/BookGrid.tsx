
import React from 'react';
import { Book } from '@/store/useStore';
import BookCard from './BookCard';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface BookGridProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
  className?: string;
}

const BookGrid: React.FC<BookGridProps> = ({ books, onBookSelect, className }) => {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="rounded-full bg-destructive/10 p-4 mb-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum livro encontrado</h3>
        <p className="text-muted-foreground text-center max-w-md mb-3">
          Verifique se a planilha está configurada corretamente.
        </p>
        <div className="bg-muted/50 p-3 rounded-md text-sm text-left max-w-md overflow-auto">
          <p className="font-semibold mb-1">Dicas:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Verifique se a planilha está compartilhada publicamente</li>
            <li>A planilha deve ter colunas: "Titulo", "Materia", "PDF_URL" ou "Link", "Imagem"</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3", className)}>
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
