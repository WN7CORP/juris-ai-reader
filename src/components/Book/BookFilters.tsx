
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownUp, Star, Clock, ListFilter, BookMarked } from 'lucide-react';
import useStore from '@/store/useStore';

interface BookFiltersProps {
  activeFilter: 'all' | 'favorites' | 'history';
  onFilterChange: (filter: 'all' | 'favorites' | 'history') => void;
}

const BookFilters: React.FC<BookFiltersProps> = ({ activeFilter, onFilterChange }) => {
  const { sortBy, setSortBy } = useStore();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <Tabs 
        defaultValue={activeFilter} 
        value={activeFilter}
        onValueChange={(value) => onFilterChange(value as 'all' | 'favorites' | 'history')}
        className="w-full sm:w-auto"
      >
        <TabsList className="w-full sm:w-auto grid grid-cols-3">
          <TabsTrigger value="all" className="text-sm">
            <BookMarked className="h-4 w-4 mr-2" />
            Todos
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-sm">
            <Star className="h-4 w-4 mr-2" />
            Favoritos
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm">
            <Clock className="h-4 w-4 mr-2" />
            Recentes
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-2 mt-2 sm:mt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowDownUp className="h-4 w-4" />
              <span className="hidden sm:inline-block">Ordenar por</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <DropdownMenuRadioItem value="order">Ordem padrão</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="name">Nome</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="rating">Avaliação</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="mostAccessed">Mais acessados</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ListFilter className="h-4 w-4" />
              <span className="sr-only">Filtrar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="grid gap-2 p-2">
              <div className="text-sm font-medium">Filtrar por avaliação</div>
              <div className="flex items-center gap-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default BookFilters;
