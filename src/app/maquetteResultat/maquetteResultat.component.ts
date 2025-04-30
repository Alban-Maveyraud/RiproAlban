import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService, Student } from '../../services/student.service'; // <- bonne importation

@Component({
  selector: 'app-maquetteResultat',
  templateUrl: './maquetteResultat.component.html',
  styleUrls: ['./maquetteResultat.component.scss']
})
export class MaquetteResultatComponent implements OnInit {

  students: Student[] = []; // plus d'array codé en dur
  selectedStudent: Student | null = null;

  constructor(
      private router: Router,
      private studentService: StudentService // injecte correctement
  ) {}

  ngOnInit() {
    const state = history.state.errorSummary;
    console.log('Récapitulatif des erreurs:', state);

    this.loadStudents();
  }

  loadStudents() {
    this.studentService.getStudents().subscribe((students) => {
      this.students = students;

      // Optionnel : sélectionne automatiquement un étudiant
      if (this.students.length > 0) {
        this.selectedStudent = this.students[0];
      }
    });
  }

  goToAccueil() {
    this.router.navigate(['/jeu']);
  }

  /** Récupère les statistiques de la dernière partie du joueur */
  getLastGameStats(student: Student) {
    if (!student.history || student.history.length === 0) {
      return null;
    }
    return student.history[student.history.length - 1];
  }

  /** Récupère le nombre d'erreurs pour un type donné sur la dernière partie */
  getWordTypeErrors(student: Student, type: string): number {
    const lastGame = this.getLastGameStats(student);
    if (!lastGame) {
      return 0;
    }
    switch (type) {
      case 'long':
        return lastGame.longWordErrors;
      case 'verb':
        return lastGame.verbErrors;
      case 'adjective':
        return lastGame.adjectiveErrors;
      case 'noun':
        return lastGame.nounErrors;
      case 'rewrite':
        return lastGame.rewriteErrors;
      default:
        return 0;
    }
  }
}
