import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
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
import { EtudiantDetailsComponent } from './etudiantPageInfo/maquetteEtudiant.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'jeu', component: MaquetteJeuComponent },
  { path: 'config', component: MaquetteConfigComponent },
  { path: 'final', component: V4FinalComponent },
  { path: 'statistique', component: StatsDisplayComponent },
  { path: 'res', component: MaquetteResultatComponent},
  { path: 'jeu-voiture', component: JeuVoitureComponent },
  { path: 'jeu-phrase', component: JeuPhraseComponent },
  { path: 'etudiant/:id', component: EtudiantDetailsComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MaquetteJeuComponent, // ← Correction ici
    MaquetteConfigComponent,
    MaquetteResultatComponent,
    MaquetteVoitureComponent,
    V4FinalComponent,
    JeuVoitureComponent,
    SafeUrlPipe,
    JeuPhraseComponent,
    StatsDisplayComponent,
    EtudiantDetailsComponent
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
