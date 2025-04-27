import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ParcoursService, ParcoursPersonnalise } from '../ParcoursPersonalise/parcours-personalise.service';

@Component({
  selector: 'app-maquetteConfig',
  templateUrl: './maquetteConfig.component.html',
  styleUrls: ['./maquetteConfig.component.scss']
})
export class MaquetteConfigComponent implements OnInit {
  parcourForm!: FormGroup;
  activeTab = 'participants';
  
  students = [
    { id: '1', nom: 'Lucas Martin', age: 8, niveau: 2 },
    { id: '2', nom: 'Emma Dubois', age: 7, niveau: 1 },
    { id: '3', nom: 'Thomas Bernard', age: 9, niveau: 3 },
    { id: '4', nom: 'Sofia Lambert', age: 8, niveau: 2 }
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
    { id: 'ex2', titre: 'Trouve l\'intrus', description: 'Repérer les anomalies', icon: '🔍', route: 'intrus' },
    { id: 'ex3', titre: 'Lettre manquante', description: 'Compléter les mots', icon: '🔤', route: 'lettre-manquante' },
    { id: 'ex4', titre: 'Karao-Quiz', description: 'Mémoriser les mots', icon: '🎤', route: 'karao-quiz' },
    { id: 'ex5', titre: 'Loto des mots', description: 'Ré-association des syllabes', icon: '🎲', route: 'loto-mots' },
    { id: 'ex6', titre: 'Association', description: 'Synonymes et contextes', icon: '🔄', route: 'association' }
  ];
  
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
    this.router.navigate(['/jeu-phrase']);
  }
  
  goToRes() {
    this.router.navigate(['/resultat']);
  }
  
  goToExercise(exercise: any): void {
    if (exercise.route) {
      this.router.navigate(['/' + exercise.route]);
    }
  }
  
  creerParcours() {
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
          alert('Parcours créé et enregistré avec succès !');
        },
        error => {
          console.error('Erreur lors de la création du parcours', error);
          this.parcoursService.sauvegarderXMLEnLocal(parcours).then(success => {
            if (success) {
              alert('Parcours enregistré localement avec succès !');
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
}
