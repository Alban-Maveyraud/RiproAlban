import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JeuVoitureComponent } from './jeu-voiture.component';

describe('JeuVoitureComponent', () => {
  let component: JeuVoitureComponent;
  let fixture: ComponentFixture<JeuVoitureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JeuVoitureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JeuVoitureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
