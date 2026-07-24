import { TestBed } from '@angular/core/testing';

import { ServicesWhatsapp } from './services-whatsapp';

describe('ServicesWhatsapp', () => {
  let service: ServicesWhatsapp;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicesWhatsapp);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
