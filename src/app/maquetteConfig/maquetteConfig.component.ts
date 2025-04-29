import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService, Student } from '../student/student.service';
import { phrases } from '../../assets/phrasesTS';
import { addPhraseWithTypes, removePhraseById } from '../../assets/phrasesTS';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-maquetteConfig',
  templateUrl: './maquetteConfig.component.html',
  styleUrls: ['./maquetteConfig.component.scss']
})
export class MaquetteConfigComponent implements OnInit {
  parcourForm!: FormGroup;
  addPhraseForm!: FormGroup;

  studentsList: Student[] = [];
  phrases = phrases;

  activeTab = 'participants';
  popupVisible = false;
  showPhrases = false;

  // Phrase temporaire et étapes d’ajout
  tempPhrase: string | null = null;
  showAudioOptions = false;
  showAudioRecording = false;

  // Audio recording
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  audioBlob: Blob | null = null;
  audioPreviewUrl: string | null = null;

  typedWords: { word: string; type: string }[] = [];
  showTypeSelection: boolean = false;


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private studentService: StudentService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.initForms();
    this.loadStudents();
  }

  /** ---------------- FORMULAIRES ---------------- **/
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

  /** ---------------- ÉTUDIANTS ---------------- **/
  loadStudents() {
    this.studentService.getStudents().subscribe(students => {
      this.studentsList = students;
    });
  }

  ajouterEtudiant() {
    if (this.parcourForm.invalid) return alert('Veuillez remplir tous les champs.');

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

  supprimerEtudiant(student: Student) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      this.studentService.removeStudent(student);
      this.loadStudents();
    }
  }

  voirDetails(student: Student) {
    this.studentService.setCurrentStudent(student);
    this.router.navigate(['/etudiant', student.id]);
  }

  /** ---------------- GESTION PHRASES ---------------- **/
    addPhrase() {
    if (this.addPhraseForm.invalid) return;

    this.tempPhrase = this.addPhraseForm.value.phrase.trim();
    const words = this.tempPhrase?.split(/\s+/) ?? [];

    this.typedWords = words.map(word => ({ word, type: 'autre' }));
    this.showTypeSelection = true;
    this.addPhraseForm.reset();
    this.showAudioOptions = true;
  }

  validerTypesEtContinuer() {
    const typesMap: { [key: string]: string } = {};
    this.typedWords.forEach(w => typesMap[w.word] = w.type);

    addPhraseWithTypes(this.tempPhrase!, typesMap);
    this.showTypeSelection = false;
    this.showAudioOptions = true;
    this.showTypeSelection = false;
  }

  envoyerPhraseSansAudio() {
    if (!this.tempPhrase) return;
    addPhraseWithTypes(this.tempPhrase, {}); // À adapter si typage obligatoire
    this.resetAudioWorkflow();
  }

  prepareRecording() {
    this.showAudioOptions = false;
    this.showAudioRecording = true;
  }

  deletePhrase(id: number) {
    if (confirm('Supprimer cette phrase ?')) {
      removePhraseById(id);
      this.phrases = [...phrases]; // Refresh
    }
  }

  togglePhrases() {
    this.showPhrases = !this.showPhrases;
  }

  /** ---------------- AUDIO ---------------- **/
  startRecording() {
    this.recordedChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();
        this.isRecording = true;

        this.mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) this.recordedChunks.push(e.data);
        };

        this.mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          this.audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          if (this.audioPreviewUrl) URL.revokeObjectURL(this.audioPreviewUrl);
          this.audioPreviewUrl = URL.createObjectURL(this.audioBlob!);
        };
      })
      .catch(err => {
        console.error('Erreur micro :', err);
        alert('Micro non accessible.');
      });
  }

  stopRecording() {
    if (!this.mediaRecorder || !this.isRecording) return;

    this.mediaRecorder.stop();
    this.isRecording = false;

    this.mediaRecorder.onstop = () => {
      // Stop toutes les pistes (libère le micro)
      const stream = this.mediaRecorder!.stream;
      stream.getTracks().forEach(track => track.stop());

      // Création du blob audio
      this.audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });

      if (this.audioPreviewUrl) {
        URL.revokeObjectURL(this.audioPreviewUrl);
      }

      this.audioPreviewUrl = URL.createObjectURL(this.audioBlob);

      // Upload automatique du fichier
      if (this.tempPhrase && this.audioBlob) {
        const formData = new FormData();
        formData.append('audio', this.audioBlob, 'recording.webm');
        formData.append('phrase', this.tempPhrase);

        this.http.post('http://localhost:3000/upload-audio', formData).subscribe({
          next: (res: any) => {
            const audioUrl = res.audioUrl || null; // À adapter selon réponse backend
            addPhraseWithTypes(this.tempPhrase!, {}, audioUrl);
            alert('Phrase avec audio enregistrée !');
            this.resetAudioWorkflow();
          },
          error: err => {
            console.error('Erreur upload audio :', err);
            alert("Échec de l'envoi de l'audio.");
          }
        });
      } else {
        alert("Pas de phrase ou audio à envoyer.");
      }
    };
  }

  uploadRecordedAudio(phraseText: string) {
    if (!this.audioBlob) return alert("Pas d'audio enregistré.");

    const formData = new FormData();
    formData.append('audio', this.audioBlob, 'recording.webm');
    formData.append('phrase', phraseText);

    this.http.post('http://localhost:3000/upload-audio', formData).subscribe({
      next: () => {
        alert('Audio enregistré avec succès.');
        this.resetAudioWorkflow();
      },
      error: err => {
        console.error(err);
        alert("Erreur lors de l'envoi de l'audio.");
      }
    });
  }

  /** ---------------- UI & UTILS ---------------- **/
  ouvrirPopup() {
    this.popupVisible = true;
  }

  fermerPopup() {
    this.popupVisible = false;
  }

  // Navigation
  goToJeu() {
    this.router.navigate(['/jeu']);
  }

  goToRes() {
    this.router.navigate(['/resultat']);
  }

  getColorForType(type: string): string {
    const colorMap: { [key: string]: string } = {
      déterminant: 'blue',
      nom: 'green',
      verbe: 'red',
      adjectif: 'orange',
      adverbe: 'purple',
      préposition: 'brown',
      pronom: 'pink',
      'nom propre': 'violet'
    };
    return colorMap[type] || 'black';
  }

  resetAudioWorkflow() {
    this.tempPhrase = null;
    this.audioBlob = null;
    this.audioPreviewUrl = null;
    this.showAudioOptions = false;
    this.showAudioRecording = false;
  }

  protected readonly URL = URL;
}
