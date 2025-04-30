import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(private router: Router) {}

  goToPlayer() {
    this.router.navigate(['/jeu']);
  }

  goToAdmin() {
    const password = prompt('Entrez le mot de passe admin :');
    if (password === 'admin') {
      this.router.navigate(['/config']);
    } else {
      alert('Mot de passe incorrect !');
    }
  }
}
