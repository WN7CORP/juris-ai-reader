
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Menu, 
  Bell, 
  User,
  BookOpen,
  SlidersHorizontal
} from 'lucide-react';
import useStore from '@/store/useStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface HeaderProps {
  onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { 
    searchQuery, 
    setSearchQuery,
    fontSize,
    setFontSize,
    contrastMode,
    setContrastMode
  } = useStore();

  const [tempQuery, setTempQuery] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(tempQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onOpenSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:flex md:items-center md:gap-2 mr-4">
          <BookOpen className="h-5 w-5 text-law-gold" />
          <span className="text-lg font-semibold">Juris AI Reader</span>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar livros, matérias..."
              className="w-full pl-8"
              value={tempQuery}
              onChange={(e) => setTempQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="ghost" size="sm" className="ml-2">
            Buscar
          </Button>
        </form>
        
        <div className="flex items-center gap-2 ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Acessibilidade</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tamanho da fonte: {fontSize}px</Label>
                  <Slider 
                    value={[fontSize]} 
                    min={12} 
                    max={24} 
                    step={1}
                    onValueChange={(value) => setFontSize(value[0])}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="contraste">Alto contraste</Label>
                  <Switch 
                    id="contraste" 
                    checked={contrastMode === 'high'}
                    onCheckedChange={(checked) => setContrastMode(checked ? 'high' : 'normal')}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Meus Livros</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
