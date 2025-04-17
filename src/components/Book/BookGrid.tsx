
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
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-destructive/10 p-6 mb-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum livro encontrado</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          Não foram encontrados livros para exibir. Isso pode ser devido a um problema de conexão com o Google Sheets ou um formato de dados incompatível.
        </p>
        <div className="bg-muted/50 p-4 rounded-md text-sm text-left max-w-xl overflow-auto">
          <p className="font-semibold mb-2">Dicas de resolução:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verifique se a planilha está compartilhada publicamente (qualquer pessoa com o link pode visualizar)</li>
            <li>A planilha deve ter colunas chamadas: "Livro", "Link", "Imagem", "Sobre", "Peso", "Ordem" e "Download"</li>
            <li>Certifique-se de que haja pelo menos um livro com título e link preenchidos</li>
          </ul>
        </div>
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
