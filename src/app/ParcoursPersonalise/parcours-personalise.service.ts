// parcours-personalise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ParcoursPersonnalise {
  eleve: {
    id: string;
    nom: string;
  };
  niveau: {
    id: string;
    libelle: string;
  };
  aspect: {
    id: string;
    libelle: string;
  };
  exercices: Array<{
    id: string;
    titre: string;
    description: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ParcoursService {
  private apiUrl = 'api/parcours';

  constructor(private http: HttpClient) { }

  creerParcoursXML(parcoursData: ParcoursPersonnalise): Observable<any> {
    const xmlContent = this.genererXML(parcoursData);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/xml'
      })
    };

    return this.http.post(this.apiUrl, xmlContent, httpOptions)
      .pipe(
        map(response => {
          console.log('Parcours enregistré avec succès', response);
          return response;
        }),
        catchError(this.handleError<any>('creerParcoursXML'))
      );
  }

  async sauvegarderXMLEnLocal(parcoursData: ParcoursPersonnalise): Promise<boolean> {
    try {
      const xmlContent = this.genererXML(parcoursData);
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `parcours_${parcoursData.eleve.nom.replace(/\s+/g, '_')}.xml`,
          types: [{
            description: 'Fichier XML',
            accept: { 'application/xml': ['.xml'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `parcours_${parcoursData.eleve.nom.replace(/\s+/g, '_')}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fichier XML', error);
      return false;
    }
  }

  private genererXML(parcoursData: ParcoursPersonnalise): string {
    const xmlDoc = document.implementation.createDocument(null, 'parcoursPersonnalise', null);
    const rootElement = xmlDoc.documentElement;
    
    // Rest of the XML generation code remains the same
    // ...
    
    const serializer = new XMLSerializer();
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + 
           serializer.serializeToString(xmlDoc);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} a échoué:`, error);
      return of(result as T);
    };
  }
}