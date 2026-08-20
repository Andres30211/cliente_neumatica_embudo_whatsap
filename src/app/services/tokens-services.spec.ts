import { TestBed } from '@angular/core/testing';

import { TokensServices } from './tokens-services';

describe('TokensServices', () => {
  let service: TokensServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokensServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
