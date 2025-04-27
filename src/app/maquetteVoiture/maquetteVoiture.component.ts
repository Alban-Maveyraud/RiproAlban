import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-maquetteVoiture',
  templateUrl: './maquetteVoiture.component.html',
  styleUrls: ['./maquetteVoiture.component.scss']
})
export class MaquetteVoitureComponent implements AfterViewInit {
  @ViewChild('gameCanvas', { static: false }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private car = { x: 0, y: 0, width: 50, height: 80, speed: 0 };
  private keys: { [key: string]: boolean } = {};
  
  ngAfterViewInit(): void {
    this.initGame();
    this.setupEventListeners();
    requestAnimationFrame(() => this.gameLoop());
  }

  private initGame(): void {
    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Position initiale de la voiture
    this.car.x = canvas.width / 2 - this.car.width / 2;
    this.car.y = canvas.height - this.car.height - 20;
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => this.keys[e.key] = true);
    window.addEventListener('keyup', (e) => this.keys[e.key] = false);
  }

  private gameLoop(): void {
    this.update();
    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    const canvas = this.gameCanvas.nativeElement;
    
    // Gestion des contrôles
    if (this.keys['ArrowUp']) this.car.speed += 0.5;
    if (this.keys['ArrowDown']) this.car.speed -= 0.5;
    if (this.keys['ArrowLeft']) this.car.x -= 5;
    if (this.keys['ArrowRight']) this.car.x += 5;
    
    // Limites de la route
    this.car.x = Math.max(0, Math.min(canvas.width - this.car.width, this.car.x));
    this.car.speed = Math.max(-2, Math.min(5, this.car.speed));
    
    // Mise à jour du HUD
    document.getElementById('speed_value')!.textContent = Math.abs(Math.round(this.car.speed * 20)).toString();
  }

  private render(): void {
    const canvas = this.gameCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner la route
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    
    // Dessiner les lignes de la route
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 5;
    for (let y = 0; y < canvas.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(canvas.width / 2 - 10, y);
      this.ctx.lineTo(canvas.width / 2 + 10, y);
      this.ctx.stroke();
    }
    
    // Dessiner la voiture
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(this.car.x, this.car.y, this.car.width, this.car.height);
  }
}