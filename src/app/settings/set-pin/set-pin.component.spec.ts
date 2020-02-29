import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPinComponent } from './set-pin.component';

describe('SetPinComponent', () => {
  let component: SetPinComponent;
  let fixture: ComponentFixture<SetPinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetPinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
