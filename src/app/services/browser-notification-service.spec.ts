import { TestBed } from '@angular/core/testing';

import { BrowserNotificationService } from './browser-notification-service';

describe('BrowserNotificationService', () => {
  let service: BrowserNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
