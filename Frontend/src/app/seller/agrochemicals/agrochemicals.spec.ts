import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Agrochemicals } from './agrochemicals';

describe('Agrochemicals', () => {
  let component: Agrochemicals;
  let fixture: ComponentFixture<Agrochemicals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Agrochemicals],
    }).compileComponents();

    fixture = TestBed.createComponent(Agrochemicals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
