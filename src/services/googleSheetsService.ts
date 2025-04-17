
import axios from 'axios';
import Papa from 'papaparse';
import { Book } from '../store/useStore';

// URL de acesso à planilha do Google Sheets (formato CSV)
const SPREADSHEET_ID = '1-RVXr9sFxJOGmiHmTwqtLkFyykeBBBYPguaED58wVHQ';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=`;

// Função para buscar os dados da planilha (GID 0 = primeira aba)
async function fetchBooksFromSheet(): Promise<Book[]> {
  try {
    // Tentamos buscar a primeira aba (GID=0)
    const response = await axios.get(`${BASE_URL}0`);
    const result = Papa.parse(response.data, { header: true });
    
    console.log("Raw spreadsheet data:", result);
    
    if (result.data && result.data.length > 0) {
      // Mapeia os dados CSV para o formato de livros
      return result.data
        .filter((row: any) => row['Livro'] && row['Link']) // Certifica-se de que há título e link
        .map((row: any, index: number) => {
          // Extrair o valor numérico do campo Peso
          const ratingMatch = row['Peso']?.match(/\d+/);
          const ratingValue = ratingMatch ? parseInt(ratingMatch[0], 10) : 5;
          
          return {
            id: `book-${index}`,
            title: row['Livro'] || 'Título não disponível',
            category: 'Direito', // Como categoria padrão
            readUrl: row['Link'] || '',
            downloadUrl: row['Download'] || '',
            coverUrl: row['Imagem'] || 'https://via.placeholder.com/150x200?text=Sem+Imagem',
            synopsis: row['Sobre'] || 'Sinopse não disponível',
            rating: `Peso: ${ratingValue} 🔥`,
            order: parseInt(row['Ordem'] || '999', 10)
          };
        });
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar dados da planilha:', error);
    return [];
  }
}

// Função para buscar todos os livros
async function fetchBooks(): Promise<{ books: Book[], categories: string[] }> {
  try {
    const books = await fetchBooksFromSheet();
    
    // Extrai categorias únicas dos livros (simplificado para um exemplo)
    const categories = ['Direito'];
    
    return { books, categories };
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    return { books: [], categories: [] };
  }
}

// Mantemos a função fetchBooksByCategory para compatibilidade
async function fetchBooksByCategory(category: string): Promise<Book[]> {
  const { books } = await fetchBooks();
  return books.filter(book => book.category === category);
}

export { fetchBooks, fetchBooksByCategory };
