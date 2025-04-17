
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import useStore from '@/store/useStore';

interface CategoryListProps {
  onCategorySelect: (category: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onCategorySelect }) => {
  const { categories, books, selectedCategory } = useStore();

  // Função para obter a URL da capa para cada categoria
  const getCategoryCoverUrl = (category: string) => {
    const categoryBooks = books.filter(book => book.category === category);
    if (categoryBooks.length > 0) {
      return categoryBooks[0].coverUrl;
    }
    return 'https://via.placeholder.com/150x200?text=Sem+Imagem';
  };

  // Função para contar o número de livros por categoria
  const getBookCount = (category: string) => {
    return books.filter(book => book.category === category).length;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Card 
          key={category}
          className={cn(
            "cursor-pointer transition-all hover:scale-105 border",
            selectedCategory === category ? "border-law-gold" : ""
          )}
          onClick={() => onCategorySelect(category)}
        >
          <CardContent className="p-0 flex flex-col">
            <div className="w-full pt-[60%] relative overflow-hidden">
              <img 
                src={getCategoryCoverUrl(category)} 
                alt={category}
                className="absolute inset-0 object-cover w-full h-full opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Book className="h-5 w-5 text-law-gold" />
                  {category}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getBookCount(category)} {getBookCount(category) === 1 ? 'livro' : 'livros'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CategoryList;
