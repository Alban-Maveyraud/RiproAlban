import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService, Student } from '../student/student.service';

@Component({
  selector: 'app-maquetteConfig',
  templateUrl: './maquetteConfig.component.html',
  styleUrls: ['./maquetteConfig.component.scss']
})
export class MaquetteConfigComponent implements OnInit {
  parcourForm!: FormGroup;
  activeTab = 'participants';
  popupVisible = false;

  // Propriété pour gérer l'étudiant sélectionné
  selectedStudent: Student | null = null;

  // Liste des étudiants
  studentsList: Student[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.initForm();
    this.getStudents();
  }

  initForm() {
    this.parcourForm = this.fb.group({
      eleve: ['', Validators.required],
      age: ['', Validators.required],
      niveau: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  // Récupérer la liste des étudiants
  getStudents() {
    this.studentService.getStudents().subscribe(students => {
      this.studentsList = students;
    });
  }

  // Changer d'onglet
  changeTab(tab: string) {
    this.activeTab = tab;
  }

  // Lancer le jeu
  goToJeu() {
    this.router.navigate(['/jeu']);
  }

  // Aller aux résultats
  goToRes() {
    this.router.navigate(['/resultat']);
  }

  // Ouvrir le popup d'ajout
  ouvrirPopup() {
    this.popupVisible = true;
  }

  // Fermer le popup d'ajout
  fermerPopup() {
    this.popupVisible = false;
  }

  // Ajouter un étudiant
  ajouterEtudiant() {
    if (this.parcourForm.valid) {
      const newStudent: Student = {
        id: this.studentsList.length + 1, // L'ID est généré simplement ici
        nom: this.parcourForm.value.eleve,
        age: this.parcourForm.value.age,
        niveau: this.parcourForm.value.niveau,
        description: this.parcourForm.value.description,
        currentSession: this.studentService.createEmptySession(),
        history: []
      };

      this.studentService.addStudent(newStudent);
      this.getStudents(); // Récupérer la liste mise à jour
      this.fermerPopup();
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  }

  // Sélectionner un étudiant (c'est facultatif maintenant)
  selectStudent(student: Student) {
    this.selectedStudent = student;
  }

  // Voir les détails d'un étudiant
  voirDetails(student: Student) {
    this.selectedStudent = student;
  }

  // Fermer le modal de détails
  fermerDetails() {
    this.selectedStudent = null;
  }

  // Supprimer un étudiant
  supprimerEtudiant(student: Student) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      this.studentService.removeStudent(student);
      this.getStudents(); // Récupérer la liste mise à jour
      this.fermerDetails();
    }
  }

  // Lancer le jeu
  lancerLeJeu() {

    this.router.navigate(['/jeu']);
  }
}
