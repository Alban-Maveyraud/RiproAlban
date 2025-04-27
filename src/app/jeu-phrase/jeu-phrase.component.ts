import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameStateService } from '../game-state.service';

interface Word {
  text: string;
  selected: boolean;
}

@Component({
  selector: 'app-jeu-phrase',
  templateUrl: './jeu-phrase.component.html',
  styleUrls: ['./jeu-phrase.component.scss']
})
export class JeuPhraseComponent implements OnInit {
  @Output() phraseCompleted = new EventEmitter<void>(); // << important pour communiquer avec le parent !

  availableWords: string[] = [];
  selectedWords: Word[] = [];
  correctPhraseWords: string[] = [];
  validationMessage: string = '';
  isAnswerValid: boolean | null = null;

  constructor(private http: HttpClient, private gameStateService: GameStateService) {}

  ngOnInit(): void {
    this.loadRandomPhrase();
  }

  loadRandomPhrase(): void {
    this.http.get('assets/phrases.txt', { responseType: 'text' }).subscribe(
      (data: string) => {
        const phrases = data.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.correctPhraseWords = randomPhrase.split(' ');
        this.availableWords = this.shuffleArray([...this.correctPhraseWords]);
        this.selectedWords = [];
        this.validationMessage = '';
        this.isAnswerValid = null;
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

  addWordToAnswer(word: string): void {
    if (!this.selectedWords.find(w => w.text === word)) {
      this.selectedWords.push({ text: word, selected: true });
      this.availableWords = this.availableWords.filter(w => w !== word);
    }
  }

  removeWordFromAnswer(index: number): void {
    const removed = this.selectedWords.splice(index, 1)[0];
    this.availableWords.push(removed.text);
    this.availableWords = this.shuffleArray(this.availableWords);
  }

  resetAnswer(): void {
    this.availableWords = this.shuffleArray([
      ...this.availableWords,
      ...this.selectedWords.map(w => w.text)
    ]);
    this.selectedWords = [];
    this.isAnswerValid = null;
    this.validationMessage = '';
  }

  validateAnswer(): void {
    const answer = this.selectedWords.map(w => w.text).join(' ').trim();
    const correct = this.correctPhraseWords.join(' ').trim();

    if (answer === correct) {
      this.isAnswerValid = true;
      this.validationMessage = 'Bravo ! 🎉';

      setTimeout(() => {
        this.gameStateService.refillFuel(); // recharge toute l'essence
        this.phraseCompleted.emit();         // <<< émet l'événement pour fermer l'overlay !
      }, 2000);

    } else {
      this.isAnswerValid = false;
      this.validationMessage = 'Essaie encore ! ❌';
    }
  }

  getDisplayWords(): Word[] {
    return this.selectedWords;
  }

  getWordClass(word: Word): string {
    return word.selected ? 'selected-word' : '';
  }

  goToConfig(): void {
    window.location.href = '/config';
  }

  playSentence(): void {
    const phrase = this.correctPhraseWords.join(' ');
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'fr-FR';
    speechSynthesis.speak(utterance);
  }
}
