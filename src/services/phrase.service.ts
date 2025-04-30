import { Injectable } from '@angular/core';
import { phrases, addPhraseWithTypes, removePhraseById, Phrase } from './phrasesTS';

@Injectable({
  providedIn: 'root'
})
export class PhraseService {

  getPhraseById(id: number): Phrase | undefined {
    return phrases.find(phrase => phrase.id === id);
  }
  addPhrase(text: string, types: { [key: string]: string }) {
    addPhraseWithTypes(text, types);
  }

  removePhrase(id: number) {
    removePhraseById(id);
  }

  getPhrases(): Phrase[] {
    return phrases;
  }

}
