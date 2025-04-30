export interface Word {
  word: string;
  type: string;
}

export interface Phrase {
  id: number;
  text: string;
  words: Word[];
  audioUrl?: string; // 🔊 URL vers l'enregistrement audio (optionnel)
}

export const phrases: Phrase[] = [
  {
    id: 1,
    text: "Le chat dort sous le soleil.",
    audioUrl: '',
    words: [
      { word: "Le", type: "déterminant" },
      { word: "chat", type: "nom" },
      { word: "dort", type: "verbe" },
      { word: "sous", type: "préposition" },
      { word: "le", type: "déterminant" },
      { word: "soleil", type: "nom" }
    ]
  },
  {
    id: 2,
    text: "La voiture rouge roule vite.",
    audioUrl: '',
    words: [
      { word: "La", type: "déterminant" },
      { word: "voiture", type: "nom" },
      { word: "rouge", type: "adjectif" },
      { word: "roule", type: "verbe" },
      { word: "vite", type: "adverbe" }
    ]
  },
  {
    id: 3,
    text: "Le livre est sur la table.",
    audioUrl: '',
    words: [
      { word: "Le", type: "déterminant" },
      { word: "livre", type: "nom" },
      { word: "est", type: "verbe" },
      { word: "sur", type: "préposition" },
      { word: "la", type: "déterminant" },
      { word: "table", type: "nom" }
    ]
  },
  {
    id: 4,
    text: "Alban est le plus gros neuille de la terre.",
    audioUrl: '',
    words: [
      { word: "Alban", type: "nom propre" },
      { word: "est", type: "verbe" },
      { word: "le", type: "déterminant" },
      { word: "plus", type: "adverbe" },
      { word: "gros", type: "adjectif" },
      { word: "neuille", type: "nom" },
      { word: "de", type: "préposition" },
      { word: "la", type: "déterminant" },
      { word: "terre", type: "nom" }
    ]
  },
  {
    id: 5,
    text: "Je mange un tacos succulent.",
    audioUrl: '',
    words: [
      { word: "Je", type: "pronom" },
      { word: "mange", type: "verbe" },
      { word: "un", type: "déterminant" },
      { word: "tacos", type: "nom" },
      { word: "succulent", type: "adjectif" }
    ]
  },
  {
    id: 6,
    text: "Je nage très vite.",
    audioUrl: '',
    words: [
      { word: "Je", type: "pronom" },
      { word: "nage", type: "verbe" },
      { word: "très", type: "adverbe" },
      { word: "vite", type: "adjectif" }
    ]
  }
];

let phraseIdCounter = phrases.length > 0 ? Math.max(...phrases.map(p => p.id)) + 1 : 1;

export function addPhraseWithTypes(phraseText: string, wordTypes: { [key: string]: string }, audioUrl?: string): void {
  const words = phraseText.split(' ').map(word => ({
    word,
    type: wordTypes[word] || 'autre'
  }));

  const newPhrase: Phrase = {
    id: phraseIdCounter++,
    text: phraseText,
    words,
    audioUrl: audioUrl || ''
  };

  phrases.push(newPhrase);
  console.log('Phrase ajoutée:', newPhrase);
}

// 🔥 Fonction pour supprimer une phrase par son id
export function removePhraseById(id: number) {
  const index = phrases.findIndex(p => p.id === id);
  if (index !== -1) {
    phrases.splice(index, 1);
  }
}
