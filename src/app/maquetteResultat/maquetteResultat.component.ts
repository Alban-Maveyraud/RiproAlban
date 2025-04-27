// maquetteResultat.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameStats } from '../game-stats/game-stats.model';

@Component({
  selector: 'app-maquetteResultat',
  templateUrl: './maquetteResultat.component.html',
  styleUrls: ['./maquetteResultat.component.scss']
})
export class MaquetteResultatComponent {
  // Données de démonstration basées sur les stats
  stats: GameStats[] = [
    {
      phrase: "Le chat noir dort sur le canapé",
      listenStats: {
        listenCount: 2,
        pauseCount: 0
      },
      reconstructionStats: {
        startTime: new Date(),
        endTime: new Date(),
        attempts: 1,
        misplacedWords: [
          {
            word: "noir",
            position: 2,
            correctPosition: 1,
            wordType: "adjective"
          }
        ]
      },
      finalScore: 85,
      difficultyAdjustments: {
        suggested: ["visual_clues", "adjective_placement_issues"],
        applied: ["visual_clues"]
      }
    },
    // Ajoutez plus de données de démonstration au besoin
  ];

  // Statistiques agrégées
  averageScore = 87;
  exercisesCompleted = 24;
  averageSessionTime = 18;

  students = [
    { name: "Lucas Martin", progress: 75, avatar: "L" },
    { name: "Emma Dubois", progress: 45, avatar: "E" },
    { name: "Thomas Bernard", progress: 92, avatar: "T" },
    { name: "Sofia Lambert", progress: 68, avatar: "S" }
  ];

  games = [
    { name: "Ouvre tes oreilles", score: 80 },
    { name: "Trouve l'intrus", score: 65 },
    { name: "Lettre manquante", score: 90 },
    { name: "Karao-Quiz", score: 75 },
    { name: "Loto des mots", score: 60 }
  ];

  recentActivities = [
    { date: "Aujourd'hui, 14:25", title: "Emma a terminé son exercice", description: "Séance de 15 minutes avec 8 phrases complétées." },
    { date: "Aujourd'hui, 11:10", title: "Thomas a atteint le niveau 3", description: "Excellente progression avec 92% de réussite." },
    { date: "Hier, 16:40", title: "Lucas a débloqué un nouvel accessoire", description: "A gagné le micro doré après 5 réussites consécutives." },
    { date: "Hier, 10:15", title: "Sofia a commencé un nouveau parcours", description: "Focus sur la mémorisation des mots complexes." }
  ];

  words = [
    { text: "maison", size: 22 },
    { text: "chat", size: 18 },
    { text: "école", size: 24 },
    { text: "jardin", size: 16 },
    { text: "famille", size: 20 },
    { text: "voiture", size: 14 },
    { text: "musique", size: 19 },
    { text: "chanson", size: 17 },
    { text: "ami", size: 21 },
    { text: "animaux", size: 15 },
    { text: "jouer", size: 23 }
  ];

  constructor(private router: Router) {}

  goToConfig() {
    this.router.navigate(['/config']);
  }

  // Méthode pour obtenir le texte des suggestions
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

  // Méthode pour calculer les erreurs par type de mot
  getWordTypeErrors(type: string): number {
    return this.stats.reduce((total, stat) => {
      return total + (stat.reconstructionStats.misplacedWords.filter(w => w.wordType === type).length);
    }, 0);
  }
}