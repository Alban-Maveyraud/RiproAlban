import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// (1) Modèle pour les stats d'une partie
export interface GameSessionStats {
  listenCount: number;
  totalErrors: number;
  longWordErrors: number;
  verbErrors: number;
  determinantErrors: number;
  adjectiveErrors: number;
  nounErrors: number;
  punctuationErrors: number;
  rewriteErrors: number;
  wrongRewriteWords: string[];
  date: Date;
}

// (2) Modèle Student mis à jour
export interface Student {
  id: number;
  nom: string;
  age: number;
  niveau: number;
  description: string;

  currentSession: GameSessionStats; // ➔ Statistiques de la partie actuelle
  history: GameSessionStats[];      // ➔ Historique des parties passées
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  // (3) Initialisation du tableau d'étudiants
  private students: Student[] = [
    {
      id: 1,
      nom: 'Lucas Martin',
      age: 8,
      niveau: 2,
      description: "Il est tarpin fort",
      currentSession: this.createEmptySession(),
      history: []
    },
    {
      id: 2,
      nom: 'Emma Dubois',
      age: 7,
      niveau: 1,
      description: "Il est tarpin fort",
      currentSession: this.createEmptySession(),
      history: []
    },
    {
      id: 3,
      nom: 'Thomas Bernard',
      age: 9,
      niveau: 3,
      description: "Il est tarpin fort",
      currentSession: this.createEmptySession(),
      history: []
    },
    {
      id: 4,
      nom: 'Sofia Lambert',
      age: 8,
      niveau: 2,
      description: "Il est tarpin fort",
      currentSession: this.createEmptySession(),
      history: []
    }
  ];

  constructor() {}

  getStudents(): Observable<Student[]> {
    return of(this.students);
  }

  // (4) Fonction utilitaire : créer une session vide
  private createEmptySession(): GameSessionStats {
    return {
      listenCount: 0,
      totalErrors: 0,
      longWordErrors: 0,
      verbErrors: 0,
      determinantErrors: 0,
      adjectiveErrors: 0,
      nounErrors: 0,
      punctuationErrors: 0,
      rewriteErrors: 0,
      wrongRewriteWords: [],
      date: new Date()
    };
  }

  finishGame(student: Student): void {
    // Ajoute la session actuelle dans l'historique
    student.history.push({ ...student.currentSession });

    // Reset la session actuelle pour une nouvelle partie
    student.currentSession = this.createEmptySession();
  }

  resetAllStudents(): void {
    this.students.forEach(student => {
      student.history = [];
      student.currentSession = this.createEmptySession();
    });
  }

  getStudentHistory(student: Student): GameSessionStats[] {
    return student.history;
  }

}
