import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Word {
  text: string;
  selected: boolean;
}

@Component({
  selector: 'app-jeu-reconstruire-phrase',
  templateUrl: './jeuReconstruirePhrase.component.html',
  styleUrls: ['./jeuReconstruirePhrase.component.scss']
})
export class JeuReconstruirePhraseComponent implements OnInit {
  availableWords: string[] = [];
  selectedWords: Word[] = [];
  correctPhraseWords: string[] = [];
  validationMessage: string = '';
  isAnswerValid: boolean | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadRandomPhrase();
  }

  loadRandomPhrase() {
    this.http.get('assets/phrases.txt', { responseType: 'text' }).subscribe(
      (data: string) => {
        const phrases = data.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        const phraseAleatoire = phrases[Math.floor(Math.random() * phrases.length)];
        this.correctPhraseWords = phraseAleatoire.split(' ');
        this.availableWords = this.shuffleArray([...this.correctPhraseWords]);
        console.log('Phrases disponibles:', phrases);
        console.log('Phrase choisie:', phraseAleatoire);

      },
      error => {
        console.error('Erreur de chargement du fichier phrases.txt', error);
      }
    );
  }

  shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  addWordToAnswer(word: string) {
    if (!this.selectedWords.find(w => w.text === word)) {
      this.selectedWords.push({ text: word, selected: true });
      this.availableWords = this.availableWords.filter(w => w !== word);
    }
  }

  removeWordFromAnswer(index: number) {
    const removed = this.selectedWords.splice(index, 1)[0];
    this.availableWords.push(removed.text);
    this.availableWords = this.shuffleArray(this.availableWords);
  }

  resetAnswer() {
    this.availableWords = this.shuffleArray([
      ...this.availableWords,
      ...this.selectedWords.map(w => w.text)
    ]);
    this.selectedWords = [];
    this.isAnswerValid = null;
    this.validationMessage = '';
  }

  validateAnswer() {
    const answer = this.selectedWords.map(w => w.text).join(' ').trim();
    const correct = this.correctPhraseWords.join(' ').trim();

    if (answer === correct) {
      this.isAnswerValid = true;
      this.validationMessage = 'Bravo ! 🎉';
    } else {
      this.isAnswerValid = false;
      this.validationMessage = 'Essaie encore ! ❌';
    }
  }

  getDisplayWords() {
    return this.selectedWords;
  }

  getWordClass(word: Word) {
    return word.selected ? 'selected-word' : '';
  }

  goToConfig() {
    // Tu peux changer la navigation ici pour revenir à ta page config
    window.location.href = '/config';
  }
}
