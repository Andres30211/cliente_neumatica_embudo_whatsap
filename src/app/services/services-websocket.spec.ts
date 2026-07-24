import { TestBed } from '@angular/core/testing';

import { ServicesWebsocket } from './services-websocket';

describe('ServicesWebsocket', () => {
  let service: ServicesWebsocket;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicesWebsocket);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
