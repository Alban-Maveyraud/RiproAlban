import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService, Student } from '../../services/student.service';
import { phrases } from '../../services/phrasesTS';
import { trigger, transition, style, animate } from '@angular/animations';
import { PhraseService } from '../../services/phrase.service';
import { ConfigService } from '../../services/config.service';

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

  availableTypes = ['verbe', 'adjectif', 'nom', 'pronom', 'déterminant', 'autre', 'longMot'];
  typedWords: { word: string; type: string }[] = [];
  showTypingPanel = false;

  constructor(
    private phraseService: PhraseService,
    private router: Router,
    private fb: FormBuilder,
    private studentService: StudentService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.initForms();
    this.loadStudents();
    this.phrases = this.phraseService.getPhrases();
  }

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
    this.showConfig = false;
  }

  loadStudents() {
    this.studentService.getStudents().subscribe(students => {
      this.studentsList = students;
    });
  }

  goToJeu() {
    this.router.navigate(['/jeu']);
  }

  addPhrase() {
    if (this.addPhraseForm.invalid) {
      alert('Veuillez saisir une phrase.');
      return;
    }

    const phraseText = this.addPhraseForm.value.phrase;
    const words = phraseText.split(' ');

    this.typedWords = words.map((word: string) => ({
      word,
      type: 'autre'
    }));

    this.showTypingPanel = true;
  }

  addPhraseToLocalList(text: string, types: { [key: string]: string }) {
    this.phraseService.addPhrase(text, types);
  }

  validerTypesEtContinuer() {
    if (this.typedWords.length === 0 || this.addPhraseForm.invalid) {
      alert('Veuillez saisir une phrase et définir le type de chaque mot.');
      return;
    }

    const phraseText = this.addPhraseForm.value.phrase;
    const typeMap = Object.fromEntries(this.typedWords.map(w => [w.word, w.type]));

    this.phraseService.addPhrase(phraseText, typeMap);

    this.addPhraseForm.reset();
    this.typedWords = [];
    this.showTypingPanel = false;

    console.log('Phrase ajoutée avec succès:', phraseText);
  }

  togglePhrases() {
    this.showPhrases = !this.showPhrases;
  }

  ouvrirPopup() {
    this.popupVisible = true;
  }

  fermerPopup() {
    this.popupVisible = false;
  }

  getColorForType(type: string): string {
    const colorMap: { [key: string]: string } = {
      déterminant: 'blue',
      nom: 'green',
      verbe: 'red',
      adjectif: 'orange',
      préposition: 'brown',
      pronom: 'pink',
      'nom propre': 'violet',
      autre: 'gray',
      longMot: 'teal'
    };
    return colorMap[type] || 'black';
  }

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

  deletePhrase(id: number) {
    if (confirm('Supprimer cette phrase ?')) {
      this.phraseService.removePhrase(id);
      this.phrases = this.phraseService.getPhrases();
    }
  }
}
