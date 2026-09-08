import { TestBed } from '@angular/core/testing';

import { VisitServices } from './visit-services';

describe('VisitServices', () => {
  let service: VisitServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisitServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
