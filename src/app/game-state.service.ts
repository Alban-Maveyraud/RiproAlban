import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private fuel: number = 100;
  private tours: number = 0;
  private participant: any = null; // <<< 🔥 Ajout ici

  constructor() { }

  decreaseFuel(amount: number) { this.fuel -= amount; }
  increaseTour() { this.tours++; }
  refillFuel() { this.fuel = 100; }
  resetTour() {this.tours = 0; }
  getFuel() { return this.fuel; }
  getTours() { return this.tours; }

  // Pour stocker/récupérer le participant
  setParticipant(participant: any) { this.participant = participant; }
  getParticipant() { return this.participant; }
}
