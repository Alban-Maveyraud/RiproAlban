import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-maquetteJeu',
  templateUrl: './maquetteJeu.component.html',
  styleUrls: ['./maquetteJeu.component.scss']
})
export class MaquetteJeuComponent {

  constructor(private router: Router) {}

  goToConfig() {
    this.router.navigate(['/config']);
  }

  startRace() {
    this.router.navigate(['/jeu-voiture']);
  }
}
