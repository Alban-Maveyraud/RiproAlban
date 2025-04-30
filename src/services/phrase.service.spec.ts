import { Injectable } from '@angular/core';
import { phrases, addPhraseWithTypes, removePhraseById, Phrase } from '../../assets/phrasesTS';

@Injectable({
  providedIn: 'root'
})
export class PhraseService {

  getPhrases(): Phrase[] {
    return phrases;
  }

  addPhrase(text: string, types: { [key: string]: string }) {
    addPhraseWithTypes(text, types);
  }

  removePhrase(id: number) {
    removePhraseById(id);
  }
}

