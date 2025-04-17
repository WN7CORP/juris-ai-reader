
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import useStore from "./store/useStore";
import { toast } from "@/components/ui/use-toast";
import { fetchBooks } from "./services/googleSheetsService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const { setBooks, setCategories } = useStore();
  
  // Load data at startup
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("Carregando livros...");
        const data = await fetchBooks();
        
        if (data.books.length === 0) {
          console.warn("Nenhum livro encontrado na planilha.");
          toast({
            title: "Atenção",
            description: "Não encontramos livros na planilha. Verifique a configuração.",
            variant: "destructive",
          });
        } else {
          setBooks(data.books);
          setCategories(data.categories);
          console.log(`${data.books.length} livros carregados.`);
          toast({
            title: "Biblioteca Carregada",
            description: `${data.books.length} livros disponíveis em ${data.categories.length} categorias.`,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a biblioteca. Tente novamente.",
          variant: "destructive",
        });
      }
    };
    
    loadInitialData();
  }, [setBooks, setCategories]);
  
  // Force dark mode as default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" forcedTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
