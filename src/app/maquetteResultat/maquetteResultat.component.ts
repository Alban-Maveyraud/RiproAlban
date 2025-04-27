import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-maquetteResultat',
    templateUrl: './maquetteResultat.component.html',
    styleUrls: ['./maquetteResultat.component.scss']
})

export class MaquetteResultatComponent {
    constructor(private router: Router) {}
    
    goToConfig() {
        this.router.navigate(['/config']);
    }
}