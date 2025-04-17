import axios from 'axios';
import Papa from 'papaparse';
import { Book } from '../store/useStore';

// URL to access the Google Sheets (CSV format)
const SPREADSHEET_ID = '1-RVXr9sFxJOGmiHmTwqtLkFyykeBBBYPguaED58wVHQ';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=`;

// Function to fetch data from the sheet
async function fetchBooksFromSheet(): Promise<Book[]> {
  try {
    const response = await axios.get(`${BASE_URL}0`);
    const result = Papa.parse(response.data, { header: true });
    
    console.log("Raw spreadsheet data:", result);
    
    if (result.data && result.data.length > 0) {
      return result.data
        .filter((row: any) => 
          row['Titulo'] && (row['PDF_URL'] || row['Link']))
        .map((row: any, index: number) => ({
          id: `book-${index}`,
          title: row['Titulo'] || 'Título não disponível',
          category: row['Materia'] || 'Geral',
          readUrl: row['PDF_URL'] || row['Link'] || '',
          downloadUrl: row['Download'] || row['PDF_URL'] || row['Link'] || '',
          coverUrl: row['Imagem'] || 'https://via.placeholder.com/150x200?text=Sem+Imagem',
          synopsis: row['Descricao'] || 'Descrição não disponível',
          rating: row['Peso'] ? `Peso: ${row['Peso']} 🔥` : 'Peso: 5 🔥',
          order: parseInt(row['Ordem'] || '999', 10)
        }));
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar dados da planilha:', error);
    return [];
  }
}

// Function to fetch all books
async function fetchBooks(): Promise<{ books: Book[], categories: string[] }> {
  try {
    const books = await fetchBooksFromSheet();
    
    // Extract unique categories
    const categories = [...new Set(books.map(book => book.category))];
    
    return { books, categories };
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    return { books: [], categories: [] };
  }
}

// Keep fetchBooksByCategory for compatibility
async function fetchBooksByCategory(category: string): Promise<Book[]> {
  const { books } = await fetchBooks();
  return books.filter(book => book.category === category);
}

export { fetchBooks, fetchBooksByCategory };
