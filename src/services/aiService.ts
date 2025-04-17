
import axios from 'axios';

// Chave da API do Gemini
const GEMINI_API_KEY = 'AIzaSyBCPCIV9jUxa4sD6TrlR74q3KTKqDZjoT8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Interface para a resposta da API Gemini
interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

// Função para gerar uma explicação do livro usando a API Gemini
async function generateBookExplanation(bookTitle: string, synopsis: string): Promise<string> {
  try {
    const prompt = `Explique com linguagem simples o conteúdo do livro ${bookTitle}, que trata sobre ${synopsis}.`;
    
    const response = await axios.post<GeminiResponse>(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
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
    
    // Extrai e retorna o texto da resposta
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

// TTS utilizando a API do Google Text-to-Speech
// Implementação simplificada usando a Web Speech API para versão inicial
async function textToSpeech(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Verifica se o navegador suporta a API de síntese de voz
    if ('speechSynthesis' in window) {
      // Cria uma nova instância de fala
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Define o idioma para português do Brasil
      utterance.lang = 'pt-BR';
      
      // Evento para quando terminar de falar
      utterance.onend = () => {
        resolve();
      };
      
      // Evento para erros
      utterance.onerror = (event) => {
        reject(new Error(`Erro na síntese de voz: ${event.error}`));
      };
      
      // Inicia a síntese de voz
      window.speechSynthesis.speak(utterance);
    } else {
      reject(new Error('Síntese de voz não suportada neste navegador.'));
    }
  });
}

// Função que combina geração de explicação e síntese de voz
async function explainAndSpeak(bookTitle: string, synopsis: string): Promise<string> {
  try {
    // Primeiro, gera a explicação
    const explanation = await generateBookExplanation(bookTitle, synopsis);
    
    // Depois, converte para voz (não aguarda para permitir o retorno rápido do texto)
    textToSpeech(explanation).catch(error => {
      console.error('Erro na síntese de voz:', error);
    });
    
    // Retorna o texto da explicação para exibição na interface
    return explanation;
  } catch (error) {
    console.error('Erro ao explicar e narrar:', error);
    return 'Ocorreu um erro ao processar a explicação. Por favor, tente novamente.';
  }
}

export { generateBookExplanation, textToSpeech, explainAndSpeak };
