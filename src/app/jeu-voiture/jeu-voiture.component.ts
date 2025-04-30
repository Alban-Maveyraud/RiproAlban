import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameStateService } from '../../services/game-state.service';
import { Router } from '@angular/router';
import { StudentService, Student } from '../../services/student.service';


@Component({
  selector: 'app-jeu-voiture',
  templateUrl: './jeu-voiture.component.html',
  styleUrls: ['./jeu-voiture.component.scss']
})
export class JeuVoitureComponent implements OnInit, OnDestroy {
  participant: Student | null = null;
  private fuelInterval!: any;
  private tourInterval!: any;
  showPhraseGame: boolean = false;
  currentStudent: any;
  studentService: any;

  constructor(private gameStateService: GameStateService, private router: Router) {}

  ngOnInit(): void {
    this.participant = this.gameStateService.getParticipant(); // Ajoute ça !
    if (!this.participant) {
      alert('Aucun participant sélectionné ! 🚨');
      this.router.navigate(['/jeu']); // Redirige si aucun participant n'est trouvé
      return;
    }
    this.startFuelConsumption();
    this.startTourMonitoring();
  }

  ngOnDestroy(): void {
    clearInterval(this.fuelInterval);
    clearInterval(this.tourInterval);
  }

  startFuelConsumption() {
    this.fuelInterval = setInterval(() => {
      this.gameStateService.decreaseFuel(1);
      if (this.gameStateService.getFuel() <= 0) {
        clearInterval(this.fuelInterval);
        clearInterval(this.tourInterval);
        alert('Tu n’as plus d’essence ! 🛑 Retour au menu.');
        window.location.href = '/jeu';
      }
    }, 1000);
  }

  startTourMonitoring() {
    this.tourInterval = setInterval(() => {
      clearInterval(this.tourInterval);
      clearInterval(this.fuelInterval);

      // 🚀 Redirection vers jeu-phrase avec participant
      const participant = this.gameStateService.getParticipant();
      if (participant) {
        this.gameStateService.increaseTour();
        this.router.navigate(['/jeu-phrase'], { state: { participant } });
      } else {
        alert("Pas de participant sélectionné 😅");
        this.router.navigate(['/jeu']); // ou autre
      }
    }, 30000); // 30 secondes
  }

  onPhraseCompleted() {
    this.showPhraseGame = false;
    this.gameStateService.increaseTour(); // 🔥 Ajout ici pour +1 tour
    this.gameStateService.refillFuel();   // recharge l'essence
    this.startFuelConsumption();          // relance essence
    this.startTourMonitoring();           // relance chrono des tours
  }

  get fuel(): number {
    return this.gameStateService.getFuel();
  }

  get tours(): number {
    return this.gameStateService.getTours();
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
