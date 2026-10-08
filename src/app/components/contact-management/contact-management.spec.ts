import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactManagement } from './contact-management';

describe('ContactManagement', () => {
  let component: ContactManagement;
  let fixture: ComponentFixture<ContactManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
