import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingSpinnerComponent } from './working-spinner.component';

describe('WorkingSpinnerComponent', () => {
  let component: WorkingSpinnerComponent;
  let fixture: ComponentFixture<WorkingSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
