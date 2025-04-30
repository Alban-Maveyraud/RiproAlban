import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ConfigOptions {
  rewrite: boolean;
  dotEnd: boolean;
  colorTypes: boolean;
  doubleClique: boolean;
  soundEnabled: boolean;
  difficultyLevel: number;
  fontSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private defaultConfig: ConfigOptions = {
    rewrite: false,
    dotEnd: false,
    colorTypes: false,
    soundEnabled: true,
    doubleClique: false,
    difficultyLevel: 1,
    fontSize: 16
  };

  private config: ConfigOptions = { ...this.defaultConfig };

  constructor() {}

  // Retourne la configuration complète
  getConfig(): Observable<ConfigOptions> {
    return of(this.config);
  }

  // Met à jour toute la configuration
  setConfig(config: Partial<ConfigOptions>): void {
    this.config = { ...this.config, ...config };
  }

  // Met à jour une seule propriété de configuration
  updateConfig<K extends keyof ConfigOptions>(key: K, value: ConfigOptions[K]): void {
    this.config = { ...this.config, [key]: value };
  }

  // Réinitialise à la configuration par défaut
  resetToDefault(): void {
    this.config = { ...this.defaultConfig };
  }

  // Sauvegarde la configuration dans le localStorage
  saveToLocalStorage(): void {
    try {
      localStorage.setItem('appConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
    }
  }

  // Charge la configuration depuis le localStorage
  loadFromLocalStorage(): void {
    try {
      const savedConfig = localStorage.getItem('appConfig');
      if (savedConfig) {
        this.config = { ...this.defaultConfig, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
  }

  // Méthodes spécifiques pour des options fréquemment utilisées
  toggleRewrite(): void {
    this.updateConfig('rewrite', !this.config.rewrite);
  }

  toggleSound(): void {
    this.updateConfig('soundEnabled', !this.config.soundEnabled);
  }

  setDifficulty(level: number): void {
    this.updateConfig('difficultyLevel', level);
  }
}
