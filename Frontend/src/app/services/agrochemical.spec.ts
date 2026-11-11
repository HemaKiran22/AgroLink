import { TestBed } from '@angular/core/testing';
import { Agrochemical } from './agrochemical';

describe('Agrochemical', () => {
  let service: Agrochemical;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Agrochemical);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
