import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService, Student } from '../student/student.service';
import { phrases } from '../../assets/phrasesTS'; // Importer les phrases depuis phrasesTS
import { addPhraseWithTypes } from '../../assets/phrasesTS'; // Ajouter l'importation de la fonction

@Component({
  selector: 'app-maquetteConfig',
  templateUrl: './maquetteConfig.component.html',
  styleUrls: ['./maquetteConfig.component.scss']
})
export class MaquetteConfigComponent implements OnInit {
  parcourForm!: FormGroup;
  activeTab = 'participants';
  popupVisible = false;
  addPhraseForm!: FormGroup; // Formulaire pour ajouter une phrase avec types manuels
  studentsList: Student[] = [];
  selectedStudent: Student | null = null;

  // Formulaire pour l'ajout de phrases
  phraseText: string = '';
  wordTypes: { [key: string]: string } = {};

  // Flag pour afficher toutes les phrases
  showPhrases = false;

  // Phrases importées
  phrases = phrases;

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

    // Formulaire pour ajouter une phrase
    this.addPhraseForm = this.fb.group({
      phrase: ['', Validators.required]
    });
  }

  // Ajouter une phrase avec les types manuels
  addPhrase() {
    if (this.addPhraseForm.invalid) {
      alert('Veuillez saisir une phrase.');
      return;
    }

    const phraseText = this.addPhraseForm.value.phrase;

    // Demander à l'utilisateur de spécifier le type pour chaque mot
    const wordTypes: { [key: string]: string } = this.getWordTypesFromUser(phraseText);

    // Appeler la fonction pour ajouter la phrase avec ses types manuels
    addPhraseWithTypes(phraseText, wordTypes);

    // Réinitialiser le formulaire d'ajout de phrase
    this.addPhraseForm.reset();
  }

  // Méthode pour récupérer les types de mots de l'utilisateur (à adapter pour un cas réel)
  getWordTypesFromUser(phrase: string): { [key: string]: string } {
    const words = phrase.split(' ');
    const wordTypes: { [key: string]: string } = {};

    // Demander à l'utilisateur de saisir manuellement le type pour chaque mot
    words.forEach(word => {
      const wordType = prompt(`Quel est le type du mot "${word}" ?`);
      if (wordType) {
        wordTypes[word] = wordType;
      } else {
        wordTypes[word] = 'autre'; // Si le type n'est pas précisé, on utilise 'autre'
      }
    });

    return wordTypes;
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

  // Méthode pour afficher toutes les phrases
  togglePhrases() {
    this.showPhrases = !this.showPhrases;
  }

  // Fonction pour obtenir la couleur en fonction du type de mot
  getColorForType(type: string): string {
    switch (type) {
      case 'déterminant':
        return 'blue';
      case 'nom':
        return 'green';
      case 'verbe':
        return 'red';
      case 'adjectif':
        return 'orange';
      case 'adverbe':
        return 'purple';
      case 'préposition':
        return 'brown';
      case 'pronom':
        return 'pink';
      case 'nom propre':
        return 'violet';
      default:
        return 'black';
    }
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
