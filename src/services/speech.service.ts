import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private isSupported: boolean;

  constructor() {
    this.isSupported =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined';
  }

  speak(text: string, lang: string = 'fr-FR'): void {
    if (!this.isSupported) {
      console.warn('🧠 Synthèse vocale non disponible sur cette plateforme.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    utterance.onerror = (event) => {
      console.error('Erreur de synthèse vocale:', event.error);
    };

    window.speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeechAvailable(): boolean {
    return this.isSupported;
  }
}
