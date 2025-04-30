import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentService, Student, GameSessionStats } from '../../services/student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-etudiant-details',
  templateUrl: './maquetteEtudiant.component.html',
  styleUrls: ['./maquetteEtudiant.component.scss']
})
export class EtudiantDetailsComponent implements OnInit {
  student: Student | null = null;
  statsHistory: GameSessionStats[] = [];

  constructor(private route: ActivatedRoute, private studentService: StudentService, private router: Router) {}

  ngOnInit(): void {
    this.student = this.studentService.getCurrentStudent();
    if (this.student) {
      this.statsHistory = this.student.history;
    }
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  goToConfig(){
    this.router.navigate(['/config']);
  }
}
