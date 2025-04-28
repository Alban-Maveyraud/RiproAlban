import { Component, OnInit } from '@angular/core';
import { StudentService, Student } from '../student/student.service';
import { Router } from '@angular/router';
import { GameStateService } from '../game-state.service'; // ⚡ ajouter GameStateService

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

  constructor(
      private studentService: StudentService,
      private gameStateService: GameStateService,
      private router: Router
  ) {}

  ngOnInit() {
    this.studentService.getStudents().subscribe((students) => {
      this.students = students;
    });
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

    setTimeout(() => {
      this.showAnimation = false;
      this.router.navigate(['/jeu-voiture']);
    }, 3000);
  }
}
