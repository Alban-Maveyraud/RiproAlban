import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

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
    V4FinalComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
