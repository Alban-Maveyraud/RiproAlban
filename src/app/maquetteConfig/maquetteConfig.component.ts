import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService, Student } from '../student/student.service';
import { phrases } from '../../assets/phrasesTS';
import { addPhraseWithTypes, removePhraseById } from '../../assets/phrasesTS';
import { trigger, transition, style, animate } from '@angular/animations';
import { ConfigService } from '../config/config.service';
@Component({
  selector: 'app-maquetteConfig',
  templateUrl: './maquetteConfig.component.html',
  styleUrls: ['./maquetteConfig.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class MaquetteConfigComponent implements OnInit {
  parcourForm!: FormGroup;
  addPhraseForm!: FormGroup;

  activeTab = 'participants';
  popupVisible = false;
  showPhrases = false;

  studentsList: Student[] = [];
  selectedStudent: Student | null = null;

  phrases = phrases;

  showConfig = false;

  config = {
    rewrite: true,
    dotEnd: false,
    colorTypes: true
  };

  toggleConfig(): void {
    this.showConfig = !this.showConfig;
  }
  availableTypes = ['verbe', 'adjectif', 'nom', 'pronoum', 'déterminant', 'autre', 'longMot'];
  typedWords: { word: string; type: string }[] = [];
  showTypingPanel = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private studentService: StudentService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.initForms();
    this.loadStudents();
  }

  // Initialisation des formulaires
  initForms() {
    this.parcourForm = this.fb.group({
      eleve: ['', Validators.required],
      age: ['', Validators.required],
      niveau: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.addPhraseForm = this.fb.group({
      phrase: ['', Validators.required]
    });
  }
  appliquerConfiguration(): void {
    this.configService.setConfig(this.config);
    console.log('Configuration appliquée :', this.config);
  }

  // Chargement des étudiants depuis le service
  loadStudents() {
    this.studentService.getStudents().subscribe(students => {
      this.studentsList = students;
    });
  }

  // Changement d'onglet
  changeTab(tab: string) {
    this.activeTab = tab;
  }

  // Navigation
  goToJeu() {
    this.router.navigate(['/jeu']);
  }

  goToRes() {
    this.router.navigate(['/resultat']);
  }

  // Ajout d'une phrase avec typage manuel
  addPhrase() {
    if (this.addPhraseForm.invalid) {
      alert('Veuillez saisir une phrase.');
      return;
    }

    const phraseText = this.addPhraseForm.value.phrase;
    const words = phraseText.split(' ');

    // Initialise les mots sans type
    this.typedWords = words.map((word: string) => ({ word, type: 'other' }));

    this.showTypingPanel = true;
  }
  validerTypesEtContinuer() {
    const phraseText = this.addPhraseForm.value.phrase;

    if (!phraseText || this.typedWords.length === 0) {
      alert("Aucune phrase à valider.");
      return;
    }

    const wordTypes: { [key: string]: string } = {};

    this.typedWords.forEach(({ word, type }) => {
      wordTypes[word] = type;
    });

    addPhraseWithTypes(phraseText, wordTypes);

    // Reset des formulaires et de l'état
    this.addPhraseForm.reset();
    this.typedWords = [];
    this.showTypingPanel = false;
  }

  // Invite l'utilisateur à spécifier un type pour chaque mot
  promptWordTypes(phrase: string): { [key: string]: string } {
    const words = phrase.split(' ');
    const types: { [key: string]: string } = {};

    words.forEach(word => {
      const type = prompt(`Quel est le type du mot "${word}" ?`) || 'autre';
      types[word] = type;
    });

    return types;
  }

  // Gestion de l'affichage
  togglePhrases() {
    this.showPhrases = !this.showPhrases;
  }

  ouvrirPopup() {
    this.popupVisible = true;
  }

  fermerPopup() {
    this.popupVisible = false;
  }

  // Couleur associée à chaque type de mot
  getColorForType(type: string): string {
    const colorMap: { [key: string]: string } = {
      déterminant: 'blue',
      nom: 'green',
      verbe: 'red',
      adjectif: 'orange',
      adverbe: 'purple',
      préposition: 'brown',
      pronom: 'pink',
      'nom propre': 'violet',
    };
    return colorMap[type] || 'black';
  }

  // Gestion des étudiants
  ajouterEtudiant() {
    if (this.parcourForm.invalid) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const newStudent: Student = {
      id: this.studentsList.length + 1,
      nom: this.parcourForm.value.eleve,
      age: this.parcourForm.value.age,
      niveau: this.parcourForm.value.niveau,
      description: this.parcourForm.value.description,
      currentSession: this.studentService.createEmptySession(),
      history: []
    };

    this.studentService.addStudent(newStudent);
    this.loadStudents();
    this.fermerPopup();
  }

  voirDetails(student: Student) {
    this.studentService.setCurrentStudent(student);
    this.router.navigate(['/etudiant', student.id]);
  }

  fermerDetails() {
    this.selectedStudent = null;
  }

  supprimerEtudiant(student: Student) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      this.studentService.removeStudent(student);
      this.loadStudents();
      this.fermerDetails();
    }
  }

  // Suppression d'une phrase
  deletePhrase(id: number) {
    if (confirm('Supprimer cette phrase ?')) {
      removePhraseById(id);
      this.phrases = [...phrases];
    }
  }
}
