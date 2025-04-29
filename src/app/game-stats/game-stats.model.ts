export interface GameStats {
  rewriteEnabled: boolean;
  dotAtEnd: boolean;
  colorizeTypes: boolean;

  phrase?: string;
  listenStats?: {
    listenCount: number;
    pauseCount: number;
  };
  reconstructionStats?: {
    startTime: Date;
    endTime?: Date;
    attempts: number;
    misplacedWords: {
      word: string;
      position: number;
      correctPosition: number;
      wordType: 'verb' | 'adjective' | 'noun' | 'other';
    }[];
  };
  writingStats?: {
    spellingErrors: {
      word: string;
      attempted: string;
      errorType: 'reversal' | 'omission' | 'substitution' | 'other';
    }[];
    listenCountBeforeWriting: number;
  };
  finalScore?: number;
  difficultyAdjustments?: {
    suggested: string[];
    applied: string[];
  };
  errors?: {
    wordErrors: { [word: string]: number };
    errorCountsByType: {
      verb: number;
      noun: number;
      adjective: number;
      determiner: number;
      longWord: number;
    };
    totalWordSelectionErrors: number;
    phraseRetypeErrors: number;
  };
}
