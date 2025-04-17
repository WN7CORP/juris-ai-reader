
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definição dos tipos
export interface Book {
  id: string;
  title: string;
  category: string;
  readUrl: string;
  downloadUrl: string;
  coverUrl: string;
  synopsis: string;
  rating: string;
  order: number;
}

export interface ReadingProgress {
  bookId: string;
  progress: number; // 0-100
  lastRead: Date;
}

export interface UserComment {
  id: string;
  bookId: string;
  userName: string;
  text: string;
  date: Date;
}

export interface Playlist {
  id: string;
  name: string;
  books: string[]; // IDs dos livros
}

interface StoreState {
  // Tema
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Livros e categorias
  books: Book[];
  setBooks: (books: Book[]) => void;
  categories: string[];
  setCategories: (categories: string[]) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  
  // Favoritos
  favorites: string[]; // IDs dos livros
  addToFavorites: (bookId: string) => void;
  removeFromFavorites: (bookId: string) => void;
  
  // Histórico de leitura
  readingHistory: ReadingProgress[];
  updateReadingProgress: (bookId: string, progress: number) => void;
  
  // Comentários
  comments: UserComment[];
  addComment: (bookId: string, userName: string, text: string) => void;
  
  // Playlists
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, bookId: string) => void;
  removeFromPlaylist: (playlistId: string, bookId: string) => void;
  
  // Filtros e pesquisa
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'name' | 'rating' | 'mostAccessed' | 'order';
  setSortBy: (sort: 'name' | 'rating' | 'mostAccessed' | 'order') => void;
  
  // Leitor e visualização
  currentBook: Book | null;
  setCurrentBook: (book: Book | null) => void;
  isReaderOpen: boolean;
  setReaderOpen: (open: boolean) => void;
  
  // Acessibilidade
  fontSize: number;
  setFontSize: (size: number) => void;
  contrastMode: 'normal' | 'high';
  setContrastMode: (mode: 'normal' | 'high') => void;
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Tema - padrão é escuro
      isDarkMode: true,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // Livros e categorias
      books: [],
      setBooks: (books) => set({ books }),
      categories: [],
      setCategories: (categories) => set({ categories }),
      selectedCategory: null,
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      
      // Favoritos
      favorites: [],
      addToFavorites: (bookId) => 
        set((state) => ({ 
          favorites: state.favorites.includes(bookId) 
            ? state.favorites 
            : [...state.favorites, bookId] 
        })),
      removeFromFavorites: (bookId) => 
        set((state) => ({ 
          favorites: state.favorites.filter(id => id !== bookId) 
        })),
      
      // Histórico de leitura
      readingHistory: [],
      updateReadingProgress: (bookId, progress) => 
        set((state) => {
          const existingProgress = state.readingHistory.find(p => p.bookId === bookId);
          
          if (existingProgress) {
            return {
              readingHistory: state.readingHistory.map(p => 
                p.bookId === bookId 
                  ? { ...p, progress, lastRead: new Date() } 
                  : p
              )
            };
          } else {
            return {
              readingHistory: [
                ...state.readingHistory, 
                { bookId, progress, lastRead: new Date() }
              ]
            };
          }
        }),
      
      // Comentários
      comments: [],
      addComment: (bookId, userName, text) => 
        set((state) => ({
          comments: [
            ...state.comments,
            {
              id: Date.now().toString(),
              bookId,
              userName,
              text,
              date: new Date()
            }
          ]
        })),
      
      // Playlists
      playlists: [],
      createPlaylist: (name) => 
        set((state) => ({
          playlists: [
            ...state.playlists,
            {
              id: Date.now().toString(),
              name,
              books: []
            }
          ]
        })),
      addToPlaylist: (playlistId, bookId) => 
        set((state) => ({
          playlists: state.playlists.map(playlist => 
            playlist.id === playlistId
              ? { 
                  ...playlist, 
                  books: playlist.books.includes(bookId)
                    ? playlist.books
                    : [...playlist.books, bookId]
                }
              : playlist
          )
        })),
      removeFromPlaylist: (playlistId, bookId) => 
        set((state) => ({
          playlists: state.playlists.map(playlist => 
            playlist.id === playlistId
              ? { 
                  ...playlist, 
                  books: playlist.books.filter(id => id !== bookId)
                }
              : playlist
          )
        })),
      
      // Filtros e pesquisa
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      sortBy: 'order',
      setSortBy: (sort) => set({ sortBy: sort }),
      
      // Leitor e visualização
      currentBook: null,
      setCurrentBook: (book) => set({ currentBook: book }),
      isReaderOpen: false,
      setReaderOpen: (open) => set({ isReaderOpen: open }),
      
      // Acessibilidade
      fontSize: 16,
      setFontSize: (size) => set({ fontSize: size }),
      contrastMode: 'normal',
      setContrastMode: (mode) => set({ contrastMode: mode }),
    }),
    {
      name: 'juris-ai-reader-storage'
    }
  )
);

export default useStore;
