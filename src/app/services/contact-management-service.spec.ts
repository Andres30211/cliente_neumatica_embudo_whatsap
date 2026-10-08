import { TestBed } from '@angular/core/testing';

import { ContactManagement } from './contact-management';

describe('ContactManagement', () => {
  let service: ContactManagement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactManagement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
