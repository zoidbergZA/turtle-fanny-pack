import { TestBed } from '@angular/core/testing';

import { SetPinGuard } from './set-pin-guard';

describe('SetPinGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SetPinGuard = TestBed.get(SetPinGuard);
    expect(service).toBeTruthy();
  });
});
