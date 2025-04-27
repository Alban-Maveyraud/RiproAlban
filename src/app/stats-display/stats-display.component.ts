import { Component, Input, OnInit } from '@angular/core';
import { GameStats } from '../game-stats/game-stats.model';
import { config as statsConfig } from '../stats-config/stats-config';


@Component({
  selector: 'app-stats-display',
  templateUrl: './stats-display.component.html',
  styleUrls: ['./stats-display.component.scss']
})
export class StatsDisplayComponent implements OnInit {
  @Input() stats: GameStats[] = [];
  statsHistory: any[] = [];
  overallStats = {
    averageScore: 0,
    totalAttempts: 0,
    errorTypes: {
      verb: 0,
      adjective: 0,
      noun: 0,
      other: 0
    }
  };

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    const history = statsConfig.getStatsHistory();
    this.statsHistory = history;
    
    // Calculer les stats globales
    this.overallStats = {
      averageScore: history.reduce((sum, record) => sum + record.score, 0) / (history.length || 1),
      totalAttempts: history.length,
      errorTypes: {
        verb: history.reduce((sum, record) => sum + record.errors.verb, 0),
        adjective: history.reduce((sum, record) => sum + record.errors.adjective, 0),
        noun: history.reduce((sum, record) => sum + record.errors.noun, 0),
        other: history.reduce((sum, record) => sum + record.errors.other, 0)
      }
    };
  }

  getWordTypeErrors(type: string): number {
    return this.stats.reduce((total, stat) => {
      return total + (stat.reconstructionStats.misplacedWords.filter(w => w.wordType === type).length);
    }, 0);
  }

  getAverageScore(): number {
    return Math.round(this.overallStats.averageScore);
  }

  getSuggestionText(suggestion: string): string {
    const suggestionsMap: {[key: string]: string} = {
      'visual_clues': 'Indices visuels',
      'segmented_listening': 'Écoute segmentée',
      'pre_placed_verbs': 'Verbes pré-positionnés',
      'verb_conjugation_practice': 'Exercices de conjugaison',
      'adjective_placement_issues': 'Placement des adjectifs'
    };
    return suggestionsMap[suggestion] || suggestion;
  }
  formatDate(date: Date): string {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}