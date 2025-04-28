import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ParcoursService, ParcoursPersonnalise } from '../ParcoursPersonalise/parcours-personalise.service';

@Component({
  selector: 'app-maquetteConfig',
  templateUrl: './maquetteConfig.component.html',
  styleUrls: ['./maquetteConfig.component.scss']
})
export class MaquetteConfigComponent implements OnInit {
  parcourForm!: FormGroup;
  activeTab = 'participants';

  students: Student[] = [
    { id: 1, nom: 'Lucas Martin', age: 8, niveau: 2, description: "Il est tarpin fort" },
    { id: 2, nom: 'Emma Dubois', age: 7, niveau: 1, description: "Il est tarpin fort" },
    { id: 3, nom: 'Thomas Bernard', age: 9, niveau: 3, description: "Il est tarpin fort" },
    { id: 4, nom: 'Sofia Lambert', age: 8, niveau: 2, description: "Il est tarpin fort" },
  ];

  difficulties = [
    { id: '1', libelle: 'Niveau 1 - Débutant' },
    { id: '2', libelle: 'Niveau 2 - Intermédiaire' },
    { id: '3', libelle: 'Niveau 3 - Avancé' }
  ];

  aspects = [
    { id: 'spelling', libelle: 'Orthographe' },
    { id: 'grammar', libelle: 'Grammaire' },
    { id: 'memory', libelle: 'Mémorisation' },
    { id: 'vocabulary', libelle: 'Vocabulaire' }
  ];

  exercises = [
    { id: 'ex1', titre: 'Ouvre tes oreilles', description: 'Reconstitue la phrase entendue', icon: '🎵', route: 'jeu-phrase' },
    { id: 'ex3', titre: 'Lettre manquante', description: 'Compléter les mots', icon: '🔤', route: 'lettre-manquante' },
    { id: 'ex4', titre: 'Karao-Quiz', description: 'Mémoriser les mots', icon: '🎤', route: 'karao-quiz' },
    { id: 'ex2', titre: 'Loto des mots', description: 'Ré-association des syllabes', icon: '🎲', route: 'loto-mots' },
  ];

  popupVisible = false;

  nouveauParticipant: Student = {
    id: 0,
    nom: '',
    age: 0,
    niveau: 1,
    description: ''
  };

  constructor(
      private router: Router,
      private fb: FormBuilder,
      private parcoursService: ParcoursService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.parcourForm = this.fb.group({
      eleve: ['', Validators.required],
      niveau: ['', Validators.required],
      aspect: ['', Validators.required],
      exercices: this.buildExercisesFormArray()
    });
  }

  buildExercisesFormArray() {
    const arr = this.exercises.map(() => this.fb.control(false));
    return this.fb.array(arr);
  }

  get exerciseControls() {
    return this.parcourForm.get('exercices') as FormArray;
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }

  goToJeu() {
    this.router.navigate(['/jeu']);
  }

  goToRes() {
    this.router.navigate(['/resultat']);
  }

  goToExercise(exercise: any): void {
    if (exercise.route) {
      this.router.navigate(['/' + exercise.route]);
    }
  }

  creerParcours(showSuccessMessage = true) {
    if (this.parcourForm.valid) {
      const formValues = this.parcourForm.value;

      const selectedStudent = this.students.find(s => s.id === formValues.eleve);
      const selectedNiveau = this.difficulties.find(d => d.id === formValues.niveau);
      const selectedAspect = this.aspects.find(a => a.id === formValues.aspect);

      if (!selectedStudent || !selectedNiveau || !selectedAspect) {
        alert('Veuillez sélectionner tous les champs obligatoires.');
        return;
      }

      const selectedExercises = this.exercises
          .filter((_, index) => formValues.exercices[index])
          .map(exercise => ({
            id: exercise.id,
            titre: exercise.titre,
            description: exercise.description
          }));

      const parcours: ParcoursPersonnalise = {
        eleve: {
          id: selectedStudent.id,
          nom: selectedStudent.nom
        },
        niveau: {
          id: selectedNiveau.id,
          libelle: selectedNiveau.libelle
        },
        aspect: {
          id: selectedAspect.id,
          libelle: selectedAspect.libelle
        },
        exercices: selectedExercises
      };

      this.parcoursService.creerParcoursXML(parcours).subscribe(
          response => {
            console.log('Parcours créé avec succès', response);
            if (showSuccessMessage) {
              alert('Parcours créé et enregistré avec succès !');
            }
          },
          error => {
            console.error('Erreur lors de la création du parcours', error);
            this.parcoursService.sauvegarderXMLEnLocal(parcours).then(success => {
              if (success) {
                if (showSuccessMessage) {
                  alert('Parcours enregistré localement avec succès !');
                }
              } else {
                alert('Erreur lors de l\'enregistrement du parcours. Veuillez réessayer.');
              }
            });
          }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }


  ouvrirPopup() {
    this.popupVisible = true;
  }

  fermerPopup() {
    this.popupVisible = false;
  }

  ajouterParticipant() {
    if (this.nouveauParticipant.nom.trim() && this.nouveauParticipant.age > 0 && this.nouveauParticipant.description.trim()) {
      const newStudent: Student = {
        id: this.students.length + 1,
        nom: this.nouveauParticipant.nom.trim(),
        age: this.nouveauParticipant.age,
        niveau: this.nouveauParticipant.niveau || 1,
        description: this.nouveauParticipant.description.trim()
      };

      this.students.push(newStudent);

      this.nouveauParticipant = { id: 0, nom: '', age: 0, niveau: 1, description: '' };
      this.fermerPopup();
    } else {
      alert('Tous les champs (Nom, Âge, Description) sont obligatoires.');
    }
  }

  selectedStudent: Student | null = null;

  voirDetails(student: Student) {
    this.selectedStudent = student;
  }
  supprimerParticipant(student: Student) {
    this.students = this.students.filter(s => s.id !== student.id);
    this.selectedStudent = null;
  }


  fermerDetails() {
    this.selectedStudent = null;
  }

  lancerLeJeu() {
    if (this.parcourForm.valid) {
      this.creerParcours(false); // On crée le parcours sans message de succès
      this.router.navigate(['/jeu']);
    } else {
      alert('Veuillez remplir tous les champs pour créer un parcours avant de lancer le jeu.');
    }
  }


}

interface Student {
  id: number;
  nom: string;
  age: number;
  niveau: number;
  description: string;
}
