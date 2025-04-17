
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Home, BookOpen, Star, History, Bookmark, List, Search, Menu, X, BookCheck, Moon, Sun } from 'lucide-react';
import useStore from '@/store/useStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobile = false, onClose }) => {
  const { 
    categories,
    selectedCategory, 
    setSelectedCategory,
    isDarkMode,
    toggleDarkMode
  } = useStore();

  const [section, setSection] = useState<'categories' | 'library'>('categories');

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    if (mobile && onClose) {
      onClose();
    }
  };

  const handleSectionClick = (newSection: 'categories' | 'library') => {
    setSection(newSection);
  };

  return (
    <div className={cn(
      "sidebar flex flex-col h-full bg-sidebar border-r border-border",
      mobile ? "w-full" : "w-64 min-w-64 hidden md:flex"
    )}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Book className="h-6 w-6 text-law-gold" />
          <h1 className="text-lg font-semibold">Juris AI Reader</h1>
        </div>
        {mobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <Separator />
      
      <div className="flex p-2">
        <Button 
          variant={section === 'categories' ? "default" : "ghost"} 
          className="flex-1"
          onClick={() => handleSectionClick('categories')}
        >
          <List className="h-4 w-4 mr-2" />
          Matérias
        </Button>
        <Button 
          variant={section === 'library' ? "default" : "ghost"} 
          className="flex-1"
          onClick={() => handleSectionClick('library')}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Biblioteca
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-1">
        {section === 'categories' && (
          <div className="space-y-1 p-2">
            <h2 className="text-sm font-semibold mb-2">Matérias Jurídicas</h2>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  selectedCategory === category ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                )}
                onClick={() => handleCategoryClick(category)}
              >
                <Book className="h-4 w-4 mr-2" />
                {category}
              </Button>
            ))}
          </div>
        )}
        
        {section === 'library' && (
          <div className="space-y-1 p-2">
            <h2 className="text-sm font-semibold mb-2">Minha Biblioteca</h2>
            <Button variant="ghost" className="w-full justify-start">
              <Home className="h-4 w-4 mr-2" />
              Início
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Search className="h-4 w-4 mr-2" />
              Pesquisar
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Star className="h-4 w-4 mr-2" />
              Favoritos
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bookmark className="h-4 w-4 mr-2" />
              Playlists
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <BookCheck className="h-4 w-4 mr-2" />
              Lidos
            </Button>
          </div>
        )}
      </ScrollArea>
      
      <Separator />
      
      <div className="p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              Modo Claro
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              Modo Escuro
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
