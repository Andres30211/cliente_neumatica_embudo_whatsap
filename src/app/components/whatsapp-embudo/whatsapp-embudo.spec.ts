import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappEmbudo } from './whatsapp-embudo';

describe('WhatsappEmbudo', () => {
  let component: WhatsappEmbudo;
  let fixture: ComponentFixture<WhatsappEmbudo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappEmbudo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappEmbudo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
