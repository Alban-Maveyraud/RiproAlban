import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MaquetteJeuComponent } from './maquetteJeu/maquetteJeu.component';
import { MaquetteConfigComponent } from './maquetteConfig/maquetteConfig.component';
import { MaquetteResultatComponent } from './maquetteResultat/maquetteResultat.component';
import { MaquetteVoitureComponent } from './maquetteVoiture/maquetteVoiture.component';
import { V4FinalComponent } from './racer/v4.final.component';
import { JeuVoitureComponent } from './jeu-voiture/jeu-voiture.component';
import { SafeUrlPipe } from './safe-url.pipe';
import { JeuPhraseComponent } from './jeu-phrase/jeu-phrase.component';
import { StatsDisplayComponent } from './stats-display/stats-display.component';
import { RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'jeu', pathMatch: 'full' },
  { path: 'jeu', component: MaquetteJeuComponent },
  { path: 'config', component: MaquetteConfigComponent },
  { path: 'final', component: V4FinalComponent },
  { path: 'resultat', component: StatsDisplayComponent },

  { path: 'jeu-voiture', component: JeuVoitureComponent },
  { path: 'jeu-phrase', component: JeuPhraseComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MaquetteJeuComponent,
    MaquetteConfigComponent,
    MaquetteResultatComponent,
    MaquetteVoitureComponent,
    V4FinalComponent,
    JeuVoitureComponent,
    SafeUrlPipe,
    JeuPhraseComponent,  // Doit être déclaré ici
    JeuVoitureComponent
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