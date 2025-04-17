
import axios from 'axios';
import * as pdfjs from 'pdfjs-dist';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Google API Key
const GOOGLE_API_KEY = 'AIzaSyBCPCIV9jUxa4sD6TrlR74q3KTKqDZjoT8';

// Text-to-Speech API Endpoint 
const TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

// Interface for PDF reading state
export interface PDFReadingState {
  currentPage: number;
  totalPages: number;
  isReading: boolean;
  currentText: string;
}

// Function to extract text from a PDF page
export async function extractTextFromPDFPage(
  pdfUrl: string, 
  pageNumber: number
): Promise<string> {
  try {
    // Load the PDF document
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    
    // Check if the requested page exists
    if (pageNumber > pdf.numPages || pageNumber < 1) {
      throw new Error(`Page ${pageNumber} does not exist in this PDF.`);
    }
    
    // Get the specified page
    const page = await pdf.getPage(pageNumber);
    
    // Extract text content
    const textContent = await page.getTextContent();
    
    // Combine the text items into a single string
    const text = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

// Function to get total pages in a PDF
export async function getPDFTotalPages(pdfUrl: string): Promise<number> {
  try {
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    return pdf.numPages;
  } catch (error) {
    console.error('Error getting PDF total pages:', error);
    return 0;
  }
}

// Function to convert text to speech using Google's Text-to-Speech API
export async function textToSpeech(text: string, language: string = 'pt-BR'): Promise<string> {
  try {
    if (!text) return '';
    
    // Chunk the text if it's too long (API has limits)
    const maxLength = 5000;
    const chunks = [];
    
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.slice(i, i + maxLength));
    }
    
    // Process each chunk and combine
    let audioContent = '';
    
    for (const chunk of chunks) {
      const response = await axios.post(
        `${TTS_API_URL}?key=${GOOGLE_API_KEY}`,
        {
          input: { text: chunk },
          voice: {
            languageCode: language,
            name: language === 'pt-BR' ? 'pt-BR-Wavenet-A' : 'en-US-Wavenet-D',
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0.0
          }
        }
      );
      
      if (response.data && response.data.audioContent) {
        audioContent += response.data.audioContent;
      }
    }
    
    return audioContent; // Base64 encoded audio
  } catch (error) {
    console.error('Error in text to speech conversion:', error);
    
    // Fallback to browser's built-in TTS if Google API fails
    try {
      return new Promise((resolve) => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = language;
          window.speechSynthesis.speak(utterance);
          resolve(''); // Return empty string to indicate we're using browser TTS
        } else {
          resolve('');
        }
      });
    } catch (e) {
      console.error('Fallback TTS failed:', e);
      return '';
    }
  }
}

// Function to generate a simple explanation
export async function generateBookExplanation(
  bookTitle: string, 
  synopsis: string
): Promise<string> {
  try {
    const prompt = `Explique com linguagem simples o conteúdo do livro ${bookTitle}, que trata sobre ${synopsis}.`;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0 &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts.length > 0
    ) {
      return response.data.candidates[0].content.parts[0].text || 
        'Não foi possível gerar uma explicação para este livro.';
    }
    
    return 'Não foi possível gerar uma explicação para este livro.';
  } catch (error) {
    console.error('Erro ao gerar explicação do livro:', error);
    return 'Erro ao gerar explicação. Por favor, tente novamente mais tarde.';
  }
}

// Function that combines explanation generation and speech synthesis
export async function explainAndSpeak(
  bookTitle: string, 
  synopsis: string
): Promise<{ text: string, audio: string }> {
  try {
    // First, generate the explanation
    const explanation = await generateBookExplanation(bookTitle, synopsis);
    
    // Then, convert to speech
    const audio = await textToSpeech(explanation);
    
    return { text: explanation, audio };
  } catch (error) {
    console.error('Erro ao explicar e narrar:', error);
    return { 
      text: 'Ocorreu um erro ao processar a explicação. Por favor, tente novamente.',
      audio: '' 
    };
  }
}
