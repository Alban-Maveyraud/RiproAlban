import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GameStateService } from '../game-state.service';
import { Router } from '@angular/router';
import { phrases } from '../../assets/phrasesTS';
import { StudentService, Student, GameSessionStats } from '../student/student.service'; // <<< Ajout
import { ActivatedRoute } from '@angular/router';
import { SpeechService } from '../../speachService/speech.service';


interface Word {
  text: string;
  selected: boolean;
  type?: 'verb' | 'adjective' | 'noun' | 'determiner' | 'other' | 'longWord';
}

@Component({
  selector: 'app-jeu-phrase',
  templateUrl: './jeu-phrase.component.html',
  styleUrls: ['./jeu-phrase.component.scss']
})
export class JeuPhraseComponent implements OnInit {
  @Output() phraseCompleted = new EventEmitter<void>();

  availableWords: string[] = [];
  selectedWords: Word[] = [];
  correctPhraseWords: Word[] = [];
  selectedStudent!: Student;

  validationMessage = '';
  isAnswerValid: boolean | null = null;
  typedAnswer = '';
  typedValidationMessage = '';
  typedAnswerIsCorrect: boolean | null = null;
  finalValidationDone = false;
  correctSentence = '';

  currentStudent!: Student; // <<< Étudiant courant
  listenStartTime: Date | null = null;

  constructor(
    private gameStateService: GameStateService,
    private studentService: StudentService,
    private router: Router,
    private route: ActivatedRoute,
    private speechService: SpeechService
  ) {}

  ngOnInit(): void {
    const student = this.studentService.getCurrentStudent();

    if (student) {
      this.currentStudent = student;
    } else {
      console.error('Aucun participant trouvé dans StudentService 😬');
      this.router.navigate(['/jeu']); // sécurité : retourne au début si pas de joueur
    }

    this.loadRandomPhrase();
  }

  loadRandomPhrase(): void {

    const randomIndex = Math.floor(Math.random() * phrases.length);
    const randomPhrase = phrases[randomIndex];

    this.correctPhraseWords = randomPhrase.words.map(w => ({
      text: w.word,
      selected: false,
      type: this.mapType(w.type)
    }));

    this.correctSentence = this.correctPhraseWords.map(w => w.text).join(' ');
    this.availableWords = this.shuffleArray(this.correctPhraseWords.map(w => w.text));
    this.currentStudent.currentSession.date = new Date(); // Met à jour la date
  }

  mapType(type: string): 'verb' | 'adjective' | 'noun' | 'determiner' | 'other' | 'longWord' {
    switch (type) {
      case 'verbe': return 'verb';
      case 'adjectif': return 'adjective';
      case 'nom': return 'noun';
      case 'déterminant': return 'determiner';
      case 'longMot': return 'longWord';
      default: return 'other';
    }
  }

  validateAnswer() {
    const correctWords = this.correctPhraseWords.map(w => w.text);
    const userWords = this.getDisplayWords().map(w => w.text);

    if (this.arraysEqual(correctWords, userWords)) {
      this.isAnswerValid = true;
      this.validationMessage = '✅ Bravo, bonne réponse !';
    } else {
      this.isAnswerValid = false;
      this.validationMessage = '❌ Désolé, ce n\'est pas encore correct.';
      this.currentStudent.currentSession.rewriteErrors++;

      // Analyse des erreurs
      userWords.forEach((word, index) => {
        if (word !== correctWords[index]) {
          this.trackWordError(word);
        }
      });
    }
  }

  trackWordError(word: string) {
    const wordInfo = this.correctPhraseWords.find(w => w.text === word);

    if (wordInfo) {
      switch (wordInfo.type) {
        case 'verb':
          this.currentStudent.currentSession.verbErrors++;
          break;
        case 'noun':
          this.currentStudent.currentSession.nounErrors++;
          break;
        case 'adjective':
          this.currentStudent.currentSession.adjectiveErrors++;
          break;
        case 'determiner':
          this.currentStudent.currentSession.determinantErrors++;
          break;
      }
    }

    if (word.length > 8) {
      this.currentStudent.currentSession.longWordErrors++;
    }

    // Ajout du mot faux pour la réécriture
    if (!this.currentStudent.currentSession.wrongRewriteWords.includes(word)) {
      this.currentStudent.currentSession.wrongRewriteWords.push(word);
    }

    // Ajout au total des erreurs
    this.currentStudent.currentSession.totalErrors++;
  }

  validateTypedAnswer(): void {
    const expected = this.correctSentence.trim();
    const typed = this.typedAnswer.trim();

    if (typed === expected) {
      this.typedValidationMessage = '✅ Bien joué, phrase correctement recopiée !';
      this.typedAnswerIsCorrect = true;
      this.finalValidationDone = true;
      setTimeout(() => {
        this.gameStateService.refillFuel();
        this.router.navigate(['/jeu-voiture']);
      }, 1000);
    } else {
      this.typedValidationMessage = '❌ Ce n\'est pas tout à fait correct. Réessaie !';
      this.typedAnswerIsCorrect = false;
      this.currentStudent.currentSession.rewriteErrors++;
      this.currentStudent.currentSession.totalErrors++;

      // ➕ Extraire les mots mal recopiés
      const expectedWords = expected.split(/\s+/);
      const typedWords = typed.split(/\s+/);

      const wrongWords: string[] = [];

      for (let i = 0; i < Math.max(expectedWords.length, typedWords.length); i++) {
        const expectedWord = expectedWords[i] ?? '';
        const typedWord = typedWords[i] ?? '';

        if (expectedWord !== typedWord && typedWord !== '') {
          wrongWords.push(typedWord);
        }
      }
      // ➕ Ajouter à l'historique de session
      this.currentStudent.currentSession.wrongRewriteWords.push(...wrongWords);
    }
  }

  resetStats(): void {
    this.availableWords = [];
    this.selectedWords = [];
    this.isAnswerValid = null;
    this.finalValidationDone = false;
    this.typedAnswer = '';
    this.typedAnswerIsCorrect = null;
    this.validationMessage = '';
    this.typedValidationMessage = '';
  }

  playSentence(): void {
    this.currentStudent.currentSession.listenCount++;

    if (this.listenStartTime) {
      this.listenStartTime = null;
    } else {
      this.listenStartTime = new Date();
    }

    const phrase = this.correctPhraseWords.map(w => w.text).join(' ');
    this.speechService.speak(phrase);
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

  shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  goToRes() {
    this.gameStateService.resetTour();
    this.gameStateService.refillFuel();

    if (this.currentStudent) {
      this.studentService.saveCurrentSessionToHistory(this.currentStudent);
    } else {
      console.error('Aucun étudiant sélectionné pour sauvegarder la session.');
    }

    this.router.navigate(['/statistique']); // ou vers ta route de résultats
  }
}
