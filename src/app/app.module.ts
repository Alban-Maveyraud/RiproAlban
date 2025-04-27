import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { QuizListComponent } from './quizzes/quiz-list/quiz-list.component';
import { QuizComponent } from './quizzes/quiz/quiz.component';
import { HeaderComponent } from './header/header.component';
import { QuizFormComponent } from './quizzes/quiz-form/quiz-form.component';
import { MaquetteJeuComponent } from './maquetteJeu/maquetteJeu.component';
import { MaquetteConfigComponent } from './maquetteConfig/maquetteConfig.component';
import { MaquetteResultatComponent } from './maquetteResultat/maquetteResultat.component';
import { MaquetteVoitureComponent } from './maquetteVoiture/maquetteVoiture.component';
import { V4FinalComponent } from './racer/v4.final.component';
import { ParcoursService } from './ParcoursPersonalise/parcours-personalise.service';
import { JeuVoitureComponent } from './jeu-voiture/jeu-voiture.component';
import { SafeUrlPipe } from './safe-url.pipe';
import { JeuPhraseComponent } from './jeu-phrase/jeu-phrase.component';

const routes: Routes = [
  { path: '', redirectTo: 'jeu', pathMatch: 'full' },
  { path: 'jeu', component: MaquetteJeuComponent },
  { path: 'config', component: MaquetteConfigComponent },
  { path: 'final', component: V4FinalComponent },
  { path: 'resultat', component: MaquetteResultatComponent },

  { path: 'jeu-voiture', component: JeuVoitureComponent },
  { path: 'jeu-phrase', component: JeuPhraseComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    QuizListComponent,
    QuizComponent,
    HeaderComponent,
    QuizFormComponent,
    MaquetteJeuComponent,
    MaquetteConfigComponent,
    MaquetteResultatComponent,
    MaquetteVoitureComponent,
    V4FinalComponent,
    JeuVoitureComponent,
    SafeUrlPipe,
    JeuPhraseComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }