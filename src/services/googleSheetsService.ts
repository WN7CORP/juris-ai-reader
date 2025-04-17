
import axios from 'axios';
import Papa from 'papaparse';
import { Book } from '../store/useStore';

// URL de acesso à planilha do Google Sheets (formato CSV)
const SPREADSHEET_ID = '1-RVXr9sFxJOGmiHmTwqtLkFyykeBBBYPguaED58wVHQ';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=`;

// Função para converter o índice da aba para o GID do Google Sheets
// Obs: Como não temos os GIDs exatos, vamos usar uma função para tentar diferentes GIDs
async function findSheetGids(): Promise<{ [key: string]: string }> {
  // Tenta buscar a primeira aba para ver se conseguimos extrair o nome da categoria
  try {
    const response = await axios.get(`${BASE_URL}0`);
    const result = Papa.parse(response.data, { header: true });
    
    // Verifica se conseguimos obter dados
    if (result.data && result.data.length > 0) {
      // Assumindo que o nome da aba é o nome da categoria
      // Tentamos buscar outros GIDs comuns
      const commonGids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const categories: { [key: string]: string } = {};
      
      await Promise.all(
        commonGids.map(async (gid) => {
          try {
            const sheetResponse = await axios.get(`${BASE_URL}${gid}`);
            const parsedData = Papa.parse(sheetResponse.data, { header: true });
            
            // Verifica se essa aba tem dados
            if (parsedData.data && parsedData.data.length > 0 && parsedData.meta.fields?.includes('Nome do Livro')) {
              // Usamos o primeiro registro de categoria como nome da aba
              // Essa é uma solução temporária até termos os GIDs exatos
              const firstRow = parsedData.data[0] as any;
              const categoryName = firstRow.Categoria || `Categoria ${gid}`;
              
              categories[categoryName] = gid.toString();
            }
          } catch (error) {
            // Ignora erros de GIDs que não existem
            console.log(`GID ${gid} não existe ou não possui dados válidos`);
          }
        })
      );
      
      return categories;
    }
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
  }
  
  // Fallback: Retornar algumas categorias comuns no Direito
  return {
    'Direito Penal': '0',
    'Direito Civil': '1',
    'Direito Constitucional': '2',
    'Direito Administrativo': '3',
    'Direito Tributário': '4',
  };
}

// Função para buscar os livros de uma categoria específica
async function fetchBooksByCategory(category: string, gid: string): Promise<Book[]> {
  try {
    const response = await axios.get(`${BASE_URL}${gid}`);
    const result = Papa.parse(response.data, { header: true });
    
    if (result.data && result.data.length > 0) {
      // Mapeia os dados CSV para o formato de livros
      return result.data
        .filter((row: any) => row['Nome do Livro'] && row['Link de Leitura'])
        .map((row: any, index: number) => ({
          id: `${category}-${index}`,
          title: row['Nome do Livro'] || 'Título não disponível',
          category: category,
          readUrl: row['Link de Leitura'] || '',
          downloadUrl: row['Link de Download'] || '',
          coverUrl: row['Imagem da Capa'] || 'https://via.placeholder.com/150x200?text=Sem+Imagem',
          synopsis: row['Sinopse'] || 'Sinopse não disponível',
          rating: row['Avaliação'] || 'Peso: 5',
          order: parseInt(row['Ordem'] || '999', 10)
        }));
    }
    return [];
  } catch (error) {
    console.error(`Erro ao buscar livros da categoria ${category}:`, error);
    return [];
  }
}

// Função para buscar todos os livros de todas as categorias
async function fetchAllBooks(): Promise<{ books: Book[], categories: string[] }> {
  try {
    // Primeiro, buscamos todas as categorias (abas) disponíveis
    const categoryGids = await findSheetGids();
    const categories = Object.keys(categoryGids);
    
    // Depois, buscamos os livros de cada categoria
    const booksPromises = categories.map(category => 
      fetchBooksByCategory(category, categoryGids[category])
    );
    
    const booksArrays = await Promise.all(booksPromises);
    const allBooks = booksArrays.flat();
    
    return {
      books: allBooks,
      categories
    };
  } catch (error) {
    console.error('Erro ao buscar todos os livros:', error);
    return { books: [], categories: [] };
  }
}

// Função alternativa para buscar dados diretos do Google Sheets via API
// Usando a Public URL como JSON (caso o método CSV falhe)
async function fetchBooksAlternative(): Promise<{ books: Book[], categories: string[] }> {
  try {
    // Esta é uma URL alternativa que tenta obter os dados via API JSON
    const publicUrl = `https://opensheet.elk.sh/${SPREADSHEET_ID}/1`;
    
    const response = await axios.get(publicUrl);
    if (response.data && Array.isArray(response.data)) {
      const books = response.data.map((row: any, index: number) => ({
        id: `book-${index}`,
        title: row['Nome do Livro'] || 'Título não disponível',
        category: row['Categoria'] || 'Geral',
        readUrl: row['Link de Leitura'] || '',
        downloadUrl: row['Link de Download'] || '',
        coverUrl: row['Imagem da Capa'] || 'https://via.placeholder.com/150x200?text=Sem+Imagem',
        synopsis: row['Sinopse'] || 'Sinopse não disponível',
        rating: row['Avaliação'] || 'Peso: 5',
        order: parseInt(row['Ordem'] || '999', 10)
      }));
      
      // Extrair categorias únicas
      const categories = [...new Set(books.map(book => book.category))];
      
      return { books, categories };
    }
    throw new Error('Formato de dados não esperado');
  } catch (error) {
    console.error('Erro ao buscar livros (método alternativo):', error);
    throw error;
  }
}

// Função principal que tenta os dois métodos de busca
async function fetchBooks(): Promise<{ books: Book[], categories: string[] }> {
  try {
    return await fetchAllBooks();
  } catch (error) {
    console.warn('Método primário falhou, tentando método alternativo:', error);
    return await fetchBooksAlternative();
  }
}

export { fetchBooks, fetchBooksByCategory };
