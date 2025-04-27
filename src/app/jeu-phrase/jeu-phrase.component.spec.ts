import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JeuPhraseComponent } from './jeu-phrase.component';

describe('JeuPhraseComponent', () => {
  let component: JeuPhraseComponent;
  let fixture: ComponentFixture<JeuPhraseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JeuPhraseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JeuPhraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
