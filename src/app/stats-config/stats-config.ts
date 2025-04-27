import { GameStats } from "../game-stats/game-stats.model";

export const statsConfig = {
  listeningStats: {
    maxListensPerPhrase: 3,
    listenPenaltyPerExtra: 10,
    pausePenalty: 5
  },
  reconstructionStats: {
    timeThresholds: {
      perfectScoreTime: 30,
      minScoreTime: 180
    },
    errorPenalties: {
      verb: 15,
      adjective: 10,
      noun: 8,
      other: 5
    }
  },
  recordStats: (gameStats: GameStats) => {
    const record: StatRecord = {
      phrase: gameStats.phrase,
      timestamp: new Date(),
      score: gameStats.finalScore,
      listenCount: gameStats.listenStats.listenCount,
      errors: {
        verb: gameStats.reconstructionStats.misplacedWords.filter((w: { wordType: string }) => w.wordType === 'verb').length,
        adjective: gameStats.reconstructionStats.misplacedWords.filter((w: { wordType: string }) => w.wordType === 'adjective').length,
        noun: gameStats.reconstructionStats.misplacedWords.filter((w: { wordType: string }) => w.wordType === 'noun').length,
        other: gameStats.reconstructionStats.misplacedWords.filter((w: { wordType: string }) => w.wordType === 'other').length
      },
      suggestions: gameStats.difficultyAdjustments.suggested
    };
    statsHistory.push(record);
    if (statsHistory.length > 100) {
      statsHistory = statsHistory.slice(-100);
    }
  },
  getStatsHistory: (): StatRecord[] => {
    return [...statsHistory];
  }
};

// Gardez le reste de votre implémentation
export interface StatRecord {
  phrase: string;
  timestamp: Date;
  score: number;
  listenCount: number;
  errors: {
    verb: number;
    adjective: number;
    noun: number;
    other: number;
  };
  suggestions: string[];
}

let statsHistory: StatRecord[] = [];

export const config = {
  // ... (le reste de la configuration reste inchangé)

  recordStats: (gameStats: GameStats) => {
    const record: StatRecord = {
      phrase: gameStats.phrase,
      timestamp: new Date(),
      score: gameStats.finalScore,
      listenCount: gameStats.listenStats.listenCount,
      errors: {
        verb: gameStats.reconstructionStats.misplacedWords.filter((w: { wordType: string }) => w.wordType === 'verb').length,
        adjective: gameStats.reconstructionStats.misplacedWords.filter((w: { wordType: string }) => w.wordType === 'adjective').length,
        noun: gameStats.reconstructionStats.misplacedWords.filter((w: { wordType: string }) => w.wordType === 'noun').length,
        other: gameStats.reconstructionStats.misplacedWords.filter((w: { wordType: string }) => w.wordType === 'other').length
      },
      suggestions: gameStats.difficultyAdjustments.suggested
    };
    statsHistory.push(record);
    if (statsHistory.length > 100) {
      statsHistory = statsHistory.slice(-100);
    }
  },

  getStatsHistory: (): StatRecord[] => {
    return [...statsHistory];
  }
};

export default config;