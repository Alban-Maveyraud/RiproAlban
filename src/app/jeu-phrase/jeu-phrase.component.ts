// jeu-phrase.component.ts
import { Component, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GameStateService } from '../game-state.service';
import { statsConfig } from '../stats-config/stats-config';
import { GameStats } from '../game-stats/game-stats.model';
import { ReactiveFormsModule } from '@angular/forms';



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
  @Output() phraseCompleted = new EventEmitter<GameStats>(); // << important pour communiquer avec le parent !

  availableWords: string[] = [];
  selectedWords: Word[] = [];
  correctPhraseWords: Word[] = [];
  validationMessage: string = '';
  isAnswerValid: boolean | null = null;

    // Stats tracking
    currentStats: Partial<GameStats> = {
      listenStats: {
        listenCount: 0,
        pauseCount: 0
      },
      reconstructionStats: {
          startTime: new Date(),
          attempts: 0,
          misplacedWords: [],
      }
    };
    listenStartTime: Date | null = null;

    constructor(private http: HttpClient, private gameStateService: GameStateService) {}

    ngOnInit(): void {
      this.loadRandomPhrase();
    }
  
    loadRandomPhrase(): void {
      this.http.get('assets/phrases.txt', { responseType: 'text' }).subscribe(
        (data: string) => {
          const phrases = data.split('\n').map(p => p.trim()).filter(p => p.length > 0);
          const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
          
          // Reset stats for new phrase
          this.currentStats = {
            phrase: randomPhrase,
            listenStats: {
              listenCount: 0,
              pauseCount: 0
            },
            reconstructionStats: {
              startTime: new Date(),
              attempts: 0,
              misplacedWords: []
            }
          };
          
          // Analyze phrase for word types (simplified - would need NLP in real app)
          this.correctPhraseWords = randomPhrase.split(' ').map(word => ({
            text: word,
            selected: false,
            type: this.detectWordType(word)
          }));
          
          this.availableWords = this.shuffleArray([...this.correctPhraseWords.map(w => w.text)]);
          this.selectedWords = [];
          this.validationMessage = '';
          this.isAnswerValid = null;
        },
        error => {
          console.error('Erreur de chargement du fichier phrases.txt', error);
        }
      );
    }
  
    private detectWordType(word: string): 'verb' | 'adjective' | 'noun' | 'other' {
      // Simplified detection - in real app use NLP or a dictionary
      if (word.endsWith('é') || word.endsWith('er') || word.endsWith('ait')) return 'verb';
      if (word.endsWith('eux') || word.endsWith('ive')) return 'adjective';
      if (word.length > 5 && !word.includes("'")) return 'noun';
      return 'other';
    }
  
    playSentence(): void {
      this.currentStats.listenStats!.listenCount++;
      
      if (this.listenStartTime) {
        // If there was a previous listen that wasn't completed
        this.currentStats.listenStats!.pauseCount++;
      }
      
      this.listenStartTime = new Date();
      
      const phrase = this.correctPhraseWords.map(w => w.text).join(' ');
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'fr-FR';
      
      utterance.onend = () => {
        this.listenStartTime = null;
      };
      
      speechSynthesis.speak(utterance);
    }
  
    // Dans la méthode validateAnswer()
validateAnswer(): void {
  this.currentStats.reconstructionStats!.attempts++;
  this.currentStats.reconstructionStats!.endTime = new Date();
  
  const answer = this.selectedWords.map(w => w.text).join(' ').trim();
  const correct = this.correctPhraseWords.map(w => w.text).join(' ').trim();

  if (answer === correct) {
    this.isAnswerValid = true;
    this.validationMessage = 'Bravo ! 🎉';
    
    this.currentStats.finalScore = this.calculateScore();
    this.currentStats.difficultyAdjustments = this.analyzeDifficulties();

    // Enregistrer les stats
    statsConfig.recordStats(this.currentStats as GameStats);

    setTimeout(() => {
      this.gameStateService.refillFuel();
      this.phraseCompleted.emit(this.currentStats as GameStats);
    }, 2000);

  } else {
    this.isAnswerValid = false;
    this.validationMessage = 'Essaie encore ! ❌';
    
    this.trackMisplacedWords(answer, correct);
    // Enregistrer les stats même en cas d'erreur
    this.currentStats.finalScore = this.calculateScore();
    this.currentStats.difficultyAdjustments = this.analyzeDifficulties();
    statsConfig.recordStats(this.currentStats as GameStats);
  }
}
  
    private trackMisplacedWords(answer: string, correct: string): void {
      const answerWords = answer.split(' ');
      const correctWords = correct.split(' ');
      
      answerWords.forEach((word, index) => {
        if (word !== correctWords[index]) {
          const correctIndex = correctWords.indexOf(word);
          if (correctIndex !== -1) {
            const correctWordData = this.correctPhraseWords[correctIndex];
            this.currentStats.reconstructionStats!.misplacedWords.push({
              word: word,
              position: index,
              correctPosition: correctIndex,
              wordType: correctWordData.type || 'other'
            });
          }
        }
      });
    }
  
    private calculateScore(): number {
      const { listenStats, reconstructionStats } = this.currentStats;
      let score = 100;
      
      // Apply listening penalties
      if (listenStats!.listenCount > statsConfig.listeningStats.maxListensPerPhrase) {
        const extraListens = listenStats!.listenCount - statsConfig.listeningStats.maxListensPerPhrase;
        score -= extraListens * statsConfig.listeningStats.listenPenaltyPerExtra;
      }
      score -= listenStats!.pauseCount * statsConfig.listeningStats.pausePenalty;
      
      // Apply reconstruction penalties
      const timeTaken = (new Date(reconstructionStats!.endTime!).getTime() - 
                        new Date(reconstructionStats!.startTime!).getTime()) / 1000;
      
      if (timeTaken > statsConfig.reconstructionStats.timeThresholds.minScoreTime) {
        score = 0;
      } else if (timeTaken > statsConfig.reconstructionStats.timeThresholds.perfectScoreTime) {
        const timePenalty = (timeTaken - statsConfig.reconstructionStats.timeThresholds.perfectScoreTime) / 10;
        score -= Math.min(timePenalty, 30);
      }
      
      reconstructionStats!.misplacedWords.forEach(word => {
        score -= statsConfig.reconstructionStats.errorPenalties[word.wordType] || 5;
      });
      
      return Math.max(0, Math.round(score));
    }
  
    private analyzeDifficulties(): { suggested: string[]; applied: string[] } {
      const difficulties: string[] = [];
      const { listenStats, reconstructionStats } = this.currentStats;
      
      // Listening difficulties
      if (listenStats!.listenCount > statsConfig.listeningStats.maxListensPerPhrase) {
        difficulties.push('too_many_listens');
      }
      if (listenStats!.pauseCount > 0) {
        difficulties.push('pauses_during_listening');
      }
      
      // Reconstruction difficulties
      const verbErrors = reconstructionStats!.misplacedWords.filter(w => w.wordType === 'verb').length;
      if (verbErrors > 0) {
        difficulties.push('verb_placement_issues');
      }
      
      const adjErrors = reconstructionStats!.misplacedWords.filter(w => w.wordType === 'adjective').length;
      if (adjErrors > 0) {
        difficulties.push('adjective_placement_issues');
      }
      
      // Determine suggestions based on difficulties
      const suggestions: string[] = [];
      if (difficulties.includes('too_many_listens')) {
        suggestions.push('visual_clues');
        suggestions.push('segmented_listening');
      }
      if (difficulties.includes('verb_placement_issues')) {
        suggestions.push('pre_placed_verbs');
        suggestions.push('verb_conjugation_practice');
      }
      // ... add more conditions based on other difficulties
      
      return {
        suggested: suggestions,
        applied: [] // Would be populated when suggestions are implemented
      };
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

  getWordClass(word: Word): string {
    return word.selected ? 'selected-word' : '';
  }

  goToConfig(): void {
    window.location.href = '/config';
  }

}
