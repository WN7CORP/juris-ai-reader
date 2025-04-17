
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
  
  // Carregar dados logo na inicialização
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("Carregando dados iniciais...");
        const data = await fetchBooks();
        console.log("Dados carregados:", data);
        
        if (data.books.length === 0) {
          console.warn("Nenhum livro encontrado na planilha.");
          toast({
            title: "Aviso",
            description: "Não foi possível carregar os livros da planilha. Verifique a conexão e tente novamente.",
            variant: "destructive",
          });
        } else {
          setBooks(data.books);
          setCategories(data.categories);
          console.log("Dados armazenados no estado global.");
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
      }
    };
    
    loadInitialData();
  }, [setBooks, setCategories]);
  
  // Forçar o modo escuro como padrão
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
