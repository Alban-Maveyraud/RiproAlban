// jeu-phrase.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameStateService } from '../game-state.service';
import { statsConfig } from '../stats-config/stats-config';
import { GameStats } from '../game-stats/game-stats.model';
import { Router } from '@angular/router';

interface Word {
  text: string;
  selected: boolean;
  type?: 'verb' | 'adjective' | 'noun' | 'other';
}

@Component({
  selector: 'app-jeu-phrase',
  templateUrl: './jeu-phrase.component.html',
  styleUrls: ['./jeu-phrase.component.scss']
})
export class JeuPhraseComponent implements OnInit {
  @Output() phraseCompleted = new EventEmitter<GameStats>();

  availableWords: string[] = [];
  selectedWords: Word[] = [];
  correctPhraseWords: Word[] = [];
  validationMessage = '';
  isAnswerValid: boolean | null = null;
  typedAnswer = '';
  typedValidationMessage = '';
  typedAnswerIsCorrect: boolean | null = null;
  finalValidationDone = false;
  correctSentence = '';

  listenCount = 0;
  wordErrors: { [word: string]: number } = {};
  errorCountsByType = { verb: 0, noun: 0, adjective: 0, determiner: 0, longWord: 0 };
  totalWordSelectionErrors = 0;
  phraseRetypeErrors = 0;

  currentStats: Partial<GameStats> = {
    listenStats: { listenCount: 0, pauseCount: 0 },
    reconstructionStats: { startTime: new Date(), attempts: 0, misplacedWords: [] }
  };
  listenStartTime: Date | null = null;

  constructor(
      private http: HttpClient,
      private gameStateService: GameStateService,
      private router: Router // 🛣️ Ajout du Router ici
  ) {}

  ngOnInit(): void {
    this.loadRandomPhrase();
  }

  validateTypedAnswer() {
    const expected = this.correctSentence.trim();
    if (this.typedAnswer.trim() === expected) {
      this.typedValidationMessage = '✅ Bien joué, phrase correctement recopiée !';
      this.typedAnswerIsCorrect = true;
      this.finalValidationDone = true;

      const completedStats: GameStats = {
        phrase: this.currentStats.phrase!,
        listenStats: this.currentStats.listenStats!,
        reconstructionStats: {
          ...this.currentStats.reconstructionStats!,
          endTime: new Date()
        },
        finalScore: this.calculateScore(),
        errors: {
          wordErrors: this.wordErrors,
          errorCountsByType: this.errorCountsByType,
          totalWordSelectionErrors: this.totalWordSelectionErrors,
          phraseRetypeErrors: this.phraseRetypeErrors
        },
        difficultyAdjustments: this.currentStats.difficultyAdjustments ?? {
          suggested: [],
          applied: []
        }
      };
      this.phraseCompleted.emit(completedStats);
      setTimeout(() => {
        this.router.navigate(['/jeu-voiture']);
      }, 1000); // petit délai pour laisser afficher "Bravo" avant de switcher
    } else {
      this.typedValidationMessage = '❌ Ce n\'est pas tout à fait correct. Réessaie !';
      this.typedAnswerIsCorrect = false;
      this.phraseRetypeErrors++;
    }
  }

  loadRandomPhrase(): void {
    this.resetStats();
    this.http.get('assets/phrases.txt', { responseType: 'text' }).subscribe(
        data => {
          const phrases = data.split('\n').map(p => p.trim()).filter(p => p.length > 0);
          const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

          this.currentStats.phrase = randomPhrase;
          this.correctPhraseWords = randomPhrase.split(' ').map(word => ({
            text: word,
            selected: false,
            type: this.detectWordType(word)
          }));

          this.availableWords = this.shuffleArray([...this.correctPhraseWords.map(w => w.text)]);
        },
        error => console.error('Erreur de chargement du fichier phrases.txt', error)
    );
  }

  resetStats(): void {
    this.wordErrors = {};
    this.errorCountsByType = { verb: 0, noun: 0, adjective: 0, determiner: 0, longWord: 0 };
    this.totalWordSelectionErrors = 0;
    this.phraseRetypeErrors = 0;
    this.correctSentence = '';
    this.listenCount = 0;
    this.isAnswerValid = null;
    this.finalValidationDone = false;
    this.typedAnswer = '';
    this.typedAnswerIsCorrect = null;
    this.validationMessage = '';
    this.typedValidationMessage = '';
  }

  playSentence(): void {
    this.listenCount++;
    this.currentStats.listenStats!.listenCount++;
    if (this.listenStartTime) this.currentStats.listenStats!.pauseCount++;
    this.listenStartTime = new Date();

    const phrase = this.correctPhraseWords.map(w => w.text).join(' ');
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'fr-FR';
    utterance.onend = () => this.listenStartTime = null;
    speechSynthesis.speak(utterance);
  }

  validateAnswer() {
    const correctSentenceWords = this.getCorrectSentenceWords();
    const userSentenceWords = this.getDisplayWords().map(w => w.text);

    if (this.arraysEqual(correctSentenceWords, userSentenceWords)) {
      this.isAnswerValid = true;
      this.validationMessage = '✅ Bravo, bonne réponse !';
      this.correctSentence = correctSentenceWords.join(' ');
    } else {
      this.isAnswerValid = false;
      this.validationMessage = '❌ Désolé, ce n\'est pas encore correct.';
      this.totalWordSelectionErrors++;
      userSentenceWords.forEach((word, index) => {
        if (word !== correctSentenceWords[index]) this.trackWordError(word);
      });
    }
  }

  trackWordError(word: string) {
    this.wordErrors[word] = (this.wordErrors[word] || 0) + 1;
    if (this.isVerb(word)) this.errorCountsByType.verb++;
    else if (this.isNoun(word)) this.errorCountsByType.noun++;
    else if (this.isAdjective(word)) this.errorCountsByType.adjective++;
    else if (this.isDeterminer(word)) this.errorCountsByType.determiner++;
    if (word.length > 8) this.errorCountsByType.longWord++;
  }

  detectWordType(word: string): 'verb' | 'adjective' | 'noun' | 'other' {
    if (word.endsWith('er') || word.endsWith('ait') || word.endsWith('é')) return 'verb';
    if (word.endsWith('eux') || word.endsWith('ive')) return 'adjective';
    if (word.length > 5 && !word.includes("'")) return 'noun';
    return 'other';
  }

  isVerb(word: string): boolean {
    return ['manger', 'courir', 'chanter', 'écouter', 'sauter'].includes(word.toLowerCase());
  }

  isNoun(word: string): boolean {
    return ['chat', 'chien', 'maison', 'musique', 'voiture'].includes(word.toLowerCase());
  }

  isAdjective(word: string): boolean {
    return ['grand', 'petit', 'joli', 'rapide', 'lent'].includes(word.toLowerCase());
  }

  isDeterminer(word: string): boolean {
    return ['le', 'la', 'les', 'un', 'une', 'des'].includes(word.toLowerCase());
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

  getDisplayWords(): Word[] {
    return this.selectedWords;
  }

  getCorrectSentenceWords(): string[] {
    return this.correctPhraseWords.map(w => w.text);
  }

  arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  getWordClass(word: Word): string {
    return word.selected ? 'selected-word' : '';
  }

  goToConfig(): void {
    window.location.href = '/config';
  }

  goToRes() {
    const errorSummary = {
      listenCount: this.listenCount,
      totalWordSelectionErrors: this.totalWordSelectionErrors,
      phraseRetypeErrors: this.phraseRetypeErrors,
      errorCountsByType: this.errorCountsByType,
      wordErrors: this.wordErrors,
      majusculeAndPointErrors: this.calculateMajusculePointErrors() // 👈 fonction à ajouter
    };

    this.router.navigate(['/resultat'], { state: { errorSummary } });
  }


  private calculateScore(): number {
    const { listenStats, reconstructionStats } = this.currentStats;
    let score = 100;

    // Appliquer pénalités sur l'écoute
    if (listenStats!.listenCount > 3) { // Exemple : 3 écoutes maximum autorisées
      const extraListens = listenStats!.listenCount - 3;
      score -= extraListens * 5;
    }
    score -= listenStats!.pauseCount * 2;

    // Appliquer pénalités sur le temps
    const endTime = reconstructionStats?.endTime || new Date();
    const startTime = reconstructionStats?.startTime || new Date();
    const timeTaken = (endTime.getTime() - startTime.getTime()) / 1000;

    if (timeTaken > 60) {
      score = Math.max(0, score - 20);
    }

    // Appliquer pénalités sur les mots mal placés
    reconstructionStats?.misplacedWords.forEach(word => {
      score -= 5;
    });

    return Math.max(0, Math.round(score));
  }

  private calculateMajusculePointErrors(): number {
    let errors = 0;
    const userTyped = this.typedAnswer.trim();
    const expected = this.correctSentence.trim();

    if (!userTyped || !expected) return 0;

    if (userTyped.charAt(0) !== expected.charAt(0)) errors++; // Majuscule au début
    if (userTyped.slice(-1) !== expected.slice(-1)) errors++; // Point ou ponctuation en fin

    return errors;
  }



}
