import { TestBed } from '@angular/core/testing';

import { RblService } from './rbl.service';

describe('RblService', () => {
  let service: RblService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RblService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
