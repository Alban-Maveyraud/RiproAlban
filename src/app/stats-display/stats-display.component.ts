import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService, Student, GameSessionStats } from '../../services/student.service';

@Component({
  selector: 'app-stats-display',
  templateUrl: './stats-display.component.html',
  styleUrls: ['./stats-display.component.scss']
})
export class StatsDisplayComponent implements OnInit {
  selectedStudent!: Student;
  currentSession!: GameSessionStats;
  statsHistory: GameSessionStats[] = [];

  constructor(private router: Router, private studentService: StudentService) {}

  ngOnInit() {
    const currentStudent = this.studentService.getCurrentStudent();

    if (currentStudent) {
      this.selectedStudent = currentStudent;
      this.currentSession = this.studentService.getCurrentSession(currentStudent);
      this.statsHistory = this.studentService.getStudentHistory(currentStudent);
    } else {
      console.error('Aucun étudiant sélectionné');
      this.router.navigate(['/jeu']); // Redirection sécurité
    }
  }

  getTotalErrors(stat: GameSessionStats): number {
    return stat.totalErrors || 0;
  }

  getErrorByType(stat: GameSessionStats, type: 'verbErrors' | 'nounErrors' | 'adjectiveErrors' | 'determinantErrors' | 'longWordErrors' | 'punctuationErrors' | 'rewriteErrors'): number {
    return stat[type] || 0;
  }

  getPunctuationErrors(stat: GameSessionStats): number {
    return stat.punctuationErrors || 0;
  }

  getRewriteErrors(stat: GameSessionStats): number {
    return stat.rewriteErrors || 0;
  }

  formatDate(timestamp: Date | string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToAccueil() {
    if (this.selectedStudent) {
      this.studentService.finishGame(this.selectedStudent);
    }
    this.router.navigate(['/jeu']);
  }
}
