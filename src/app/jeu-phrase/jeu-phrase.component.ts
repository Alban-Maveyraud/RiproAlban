import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { Router } from '@angular/router';
import { phrases } from '../../services/phrasesTS';
import { StudentService, Student, GameSessionStats } from '../../services/student.service'; // <<< Ajout
import { ActivatedRoute } from '@angular/router';
import { SpeechService } from '../../services/speech.service';
import { GameStats } from '../game-stats/game-stats.model';
import { MaquetteConfigComponent } from '../maquetteConfig/maquetteConfig.component'; // <<< Ajout
import { ConfigService } from '../../services/config.service'; // <<< Ajout


interface Word {
  text: string;
  selected: boolean;
  type?: 'verb' | 'adjective' | 'noun' | 'pronoun' | 'determiner' | 'other' | 'longWord';
}
interface ConfigOptions {
  rewrite: boolean;
  dotEnd: boolean;
  colorTypes: boolean;
  soundEnabled: boolean;
  difficultyLevel: number;
  fontSize: number;
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

  config!: ConfigOptions;
  constructor(
    private gameStateService: GameStateService,
    private studentService: StudentService,
    private router: Router,
    private route: ActivatedRoute,
    private speechService: SpeechService,
    private configService: ConfigService
  ) {}

  // Ajoutez cette propriété à votre composant
readonly wordTypeColors: Record<string, {bg: string, text: string}> = {
  'verb': { bg: '#FFCDD2', text: '#B71C1C' },      // Rouge
  'noun': { bg: '#C8E6C9', text: '#1B5E20' },     // Vert
  'adjective': { bg: '#BBDEFB', text: '#0D47A1' }, // Bleu
  'determiner': { bg: '#FFF9C4', text: '#F57F17' },// Jaune
  'longWord': { bg: '#E1BEE7', text: '#4A148C' },  // Violet
  'pronoun': { bg: '#FFAB91', text: '#BF360C' }, // Orange
  'other': { bg: '#F5F5F5', text: '#212121' }     // Gris (par défaut)
};
  ngOnInit(): void {
    this.configService.getConfig().subscribe(config => {
      this.config = config;
    });
    const student = this.studentService.getCurrentStudent();

    if (student) {
      this.currentStudent = student;
    } else {
      console.error('Aucun participant trouvé dans StudentService 😬');
      this.router.navigate(['/jeu']); // sécurité : retourne au début si pas de joueur
    }

    this.loadRandomPhrase();
  }
  getWordClass(word: Word): string {
    if (!this.config.colorTypes) return '';

    switch(word.type) {
      case 'verb':
        return 'word-verb';
      case 'noun':
        return 'word-noun';
      case 'pronoun':
        return 'word-pronoun';
      case 'adjective':
        return 'word-adjective';
      case 'determiner':
        return 'word-determiner';
      case 'longWord':
        return 'word-long';
      default:
        return '';
    }
  }
  getWordType(wordText: string): string {
    if (!this.config.colorTypes) return '';

    const word = this.correctPhraseWords.find(w => w.text === wordText);
    return word?.type || '';
  }
  loadRandomPhrase(): void {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    const randomPhrase = phrases[randomIndex];

    this.correctPhraseWords = randomPhrase.words.map(w => ({
      text: w.word,
      selected: false,
      type: this.mapType(w.type) // Cette méthode doit être correctement définie
    }));

    // Ajoute le point final si dotEnd est true
    if (this.config.dotEnd && this.correctPhraseWords.length > 0) {
    this.correctPhraseWords[this.correctPhraseWords.length - 1].text += '.';
    this.availableWords.push('.'); // Ajoute le point comme mot sélectionnable
  }

    this.correctSentence = this.correctPhraseWords.map(w => w.text).join(' ');
    this.availableWords = this.shuffleArray(this.correctPhraseWords.map(w => w.text));
    this.currentStudent.currentSession.date = new Date(); // Met à jour la date
  }
  getWordStyle(word: Word | string): any {
  if (!this.config.colorTypes) return {};

  // Gère à la fois les objets Word et les strings
  const type = typeof word === 'string'
    ? this.correctPhraseWords.find(w => w.text === word)?.type || 'other'
    : word.type || 'other';

  return {
    'background-color': this.wordTypeColors[type].bg,
    'color': this.wordTypeColors[type].text,
    'border': `1px solid ${this.wordTypeColors[type].text}`
  };
}

mapType(type: string): 'verb' | 'adjective' | 'noun' | 'pronoun' | 'determiner' | 'other' | 'longWord' {
  switch (type.toLowerCase()) {
    case 'verbe':
    case 'verb':
      return 'verb';
    case 'adjectif':
    case 'adjective':
      return 'adjective';
    case 'nom':
    case 'noun':
      return 'noun';
    case 'pronom':
    case 'pronoun':
      return 'pronoun';
    case 'déterminant':
    case 'determiner':
      return 'determiner';
    case 'longmot':
    case 'longword':
      return 'longWord';
    default:
      return 'other';
  }
}
  validateAnswer(): void {
    // Construire la réponse en prenant en compte que le point peut être un élément séparé
    let answer = this.selectedWords
        .map(w => w.text === '.' ? '.' : w.text)
        .join(' ')
        .replace(/ \./g, '.') // Supprime l'espace avant le point
        .trim();

    let expected = this.correctSentence.trim();

    // Normalise en enlevant les points finaux pour la comparaison
    if (!this.config.dotEnd) {
        answer = answer.replace(/\.$/, '');
        expected = expected.replace(/\.$/, '');
    }

    if (answer === expected) {
      this.isAnswerValid = true;
      this.validationMessage = '✅ Bonne réponse !';

      if (!this.config.rewrite) {
        this.finalValidationDone = true;
        this.validationMessage = '✅ Bonne réponse ! Passage au jeu de voiture...';

        setTimeout(() => {
          this.gameStateService.refillFuel();
          this.router.navigate(['/jeu-voiture']);
        }, 1500); // petit délai pour laisser lire le message
      }
    } else {
      this.isAnswerValid = false;
      this.validationMessage = '❌ Ce n\'est pas tout à fait ça. Réessaie !';
      this.currentStudent.currentSession.totalErrors++;
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
    if (!this.config.rewrite) {
      this.finalValidationDone = true;
      setTimeout(() => {
        this.gameStateService.refillFuel();
        this.router.navigate(['/jeu-voiture']);
      }, 1000);
      return;
    }

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
