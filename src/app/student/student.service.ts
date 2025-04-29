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
  ];

  private currentStudent: Student | null = null;

  constructor() {}

  createEmptySession(): GameSessionStats {
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

  getStudents(): Observable<Student[]> {
    return of(this.students);
  }

  getStudentById(id: number): Student | undefined {
    return this.students.find(student => student.id === id);
  }

  addStudent(newStudent: Student): void {
    this.students.push(newStudent);
  }

  removeStudent(student: Student): void {
    const index = this.students.indexOf(student);
    if (index !== -1) {
      this.students.splice(index, 1);
    }
  }

  finishGame(student: Student): void {
    // Ajoute la session actuelle dans l'historique
    student.history.push({ ...student.currentSession });

    // Réinitialiser la session actuelle pour une nouvelle partie
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


  getCurrentSession(student: Student): GameSessionStats {
    return student.currentSession;
  }


  setCurrentStudent(student: Student): void {
    this.currentStudent = student;
  }

  getCurrentStudent(): Student | null {
    return this.currentStudent;
  }

  saveCurrentSessionToHistory(student: Student): void {
    if (!student) {
      console.error('Aucun étudiant fourni à saveCurrentSessionToHistory()');
      return;
    }
    // Clone proprement la session actuelle pour éviter les effets de bord
    const sessionCopy: GameSessionStats = { ...student.currentSession, date: new Date() };

    // Ajoute au début de l'historique pour avoir les dernières parties en haut (optionnel)
    student.history.unshift(sessionCopy);
  }

  clearStudentHistory(student: Student): void {
    if (!student) {
      console.error('Aucun étudiant fourni à clearStudentHistory()');
      return;
    }

    student.history = [];
    student.currentSession = this.createEmptySession(); // On reset aussi la session actuelle pour être propre
  }

  resetCurrentSession(student: Student): void {
    if (!student) {
      console.error('Aucun étudiant fourni à resetCurrentSession()');
      return;
    }
    student.currentSession = this.createEmptySession();
  }
}
