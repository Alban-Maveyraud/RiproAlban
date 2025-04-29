export interface Word {
  word: string;
  type: string;
}

export interface Phrase {
  text: string;
  words: Word[];
}

export const phrases = [
  {
    text: "Le chat dort sous le soleil.",
    words: [
      { word: "Le", type: "determinant" },
      { word: "chat", type: "nom" },
      { word: "dort", type: "verbe" },
      { word: "sous", type: "préposition" },
      { word: "le", type: "déterminant" },
      { word: "soleil", type: "nom" }
    ]
  },
  {
    text: "La voiture rouge roule vite.",
    words: [
      { word: "La", type: "determinant" },
      { word: "voiture", type: "nom" },
      { word: "rouge", type: "adjectif" },
      { word: "roule", type: "verbe" },
      { word: "vite", type: "adverbe" }
    ]
  },
  {
    text: "Le livre est sur la table.",
    words: [
      { word: "Le", type: "determinant" },
      { word: "livre", type: "nom" },
      { word: "est", type: "verbe" },
      { word: "sur", type: "préposition" },
      { word: "la", type: "déterminant" },
      { word: "table", type: "nom" }
    ]
  },
  {
    text: "Alban est le plus gros neuille de la terre.",
    words: [
      { word: "Alban", type: "nom propre" },
      { word: "est", type: "verbe" },
      { word: "le", type: "determinant" },
      { word: "plus", type: "adverbe" },
      { word: "gros", type: "adjectif" },
      { word: "neuille", type: "nom" },
      { word: "de", type: "préposition" },
      { word: "la", type: "determinant" },
      { word: "terre", type: "nom" }
    ]
  },
  {
    text: "Je mange un tacos succulent.",
    words: [
      { word: "Je", type: "pronom" },
      { word: "mange", type: "verbe" },
      { word: "un", type: "determinant" },
      { word: "tacos", type: "nom" },
      { word: "succulent", type: "adjectif" },
    ]
  },
  {
    text: "Je nage très vite.",
    words: [
      { word: "Je", type: "pronom" },
      { word: "nage", type: "verbe" },
      { word: "très", type: "adverbe" },
      { word: "vite", type: "adjectif" }
    ]
  }
];

// Fonction pour ajouter une phrase avec les types manuellement définis
export function addPhraseWithTypes(phraseText: string, wordTypes: { [key: string]: string }): void {
  const words = phraseText.split(' ').map((word: string, index: number) => {
    // On récupère le type du mot selon l'index
    const type = wordTypes[word] || 'autre'; // Si aucun type n'est trouvé, le type sera "autre"
    return { word, type };
  });

  const newPhrase: Phrase = {
    text: phraseText,
    words: words
  };

  phrases.push(newPhrase); // Ajouter la nouvelle phrase au tableau des phrases
  console.log('Phrase ajoutée:', newPhrase);
}
