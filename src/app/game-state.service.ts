import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  fuel: number = 100; // 100% d'essence au départ
  tours: number = 0;  // nombre de tours effectués

  constructor() {}

  decreaseFuel(amount: number) {
    this.fuel = Math.max(0, this.fuel - amount);
  }

  refillFuel() {
    this.fuel = 100;
  }

  increaseTour() {
    this.tours++;
  }

  resetTours() {
    this.tours = 0;
  }

  getFuel() {
    return this.fuel;
  }

  getTours() {
    return this.tours;
  }
}
