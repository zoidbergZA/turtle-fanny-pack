import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinPromptComponent } from './pin-prompt.component';

describe('PinPromptComponent', () => {
  let component: PinPromptComponent;
  let fixture: ComponentFixture<PinPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinPromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
