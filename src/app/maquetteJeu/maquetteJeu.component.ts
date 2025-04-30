import { Component, OnInit } from '@angular/core';
import { StudentService, Student } from '../../services/student.service';
import { Router } from '@angular/router';
import { GameStateService } from '../../services/game-state.service'; // ⚡ ajouter GameStateService
import { GameStats } from '../game-stats/game-stats.model'; // ⚡ ajouter GameStats
@Component({
  selector: 'app-maquette-jeu',
  templateUrl: './maquetteJeu.component.html',
  styleUrls: ['./maquetteJeu.component.scss']
})
export class MaquetteJeuComponent implements OnInit {

  students: Student[] = [];
  participant?: Student;
  showAnimation = false;
  showGame = false;
  raceStarted = false;

  config = {
    rewrite: false,
    dotEnd: false,
    colorTypes: false
  };


  constructor(
      private studentService: StudentService,
      private gameStateService: GameStateService,
      private router: Router
  ) {}

  ngOnInit() {
    this.studentService.getStudents().subscribe((students) => {
      this.students = students;
      const stats: GameStats = {
        rewriteEnabled: this.config.rewrite,
        dotAtEnd: this.config.dotEnd,
        colorizeTypes: this.config.colorTypes,
        phrase: '',
        listenStats: {
          listenCount: 0,
          pauseCount: 0
        },
        reconstructionStats: {
          startTime: new Date(),
          attempts: 0,
          misplacedWords: []
        },
        finalScore: 0,
        difficultyAdjustments: {
          suggested: [],
          applied: []
        }
      };
    });
  }
  quitter(): void {
    this.router.navigate(['']); // adapte cette route si besoin
  }

  goToAdmin() {
    const password = prompt('Entrez le mot de passe admin :');
    if (password === 'admin') {
      this.router.navigate(['/config']);
    } else {
      alert('Mot de passe incorrect !');
    }
  }

  onParticipantSelected(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedName = selectElement.value;
    this.participant = this.students.find(s => s.nom === selectedName);
  }

  startRace() {
    if (!this.participant) {
      alert('🚨 Merci de sélectionner un joueur avant de démarrer la course !');
      return;
    }

    this.raceStarted = true;
    this.showAnimation = true;

    // 🛑 Enregistrer le participant dans le GameState
    this.gameStateService.setParticipant(this.participant);
    this.studentService.setCurrentStudent(this.participant);

    // 💥 Réinitialise la session actuelle du participant sélectionné
    this.studentService.resetCurrentSession(this.participant);

    setTimeout(() => {
      this.showAnimation = false;
      this.router.navigate(['/jeu-voiture']);
    }, 3000);
  }
  appliquerConfiguration(): void {
    const stats: GameStats = {
      rewriteEnabled: this.config.rewrite,
      dotAtEnd: this.config.dotEnd,
      colorizeTypes: this.config.colorTypes
      // + autres propriétés par défaut si nécessaire
    };

    console.log('Configuration enregistrée dans les stats :', stats);
    // this.statsService.update(stats); // Exemple si tu veux envoyer vers un service
  }
}
