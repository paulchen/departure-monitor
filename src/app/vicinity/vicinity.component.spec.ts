import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VicinityComponent } from './vicinity.component';

describe('SearchComponent', () => {
  let component: VicinityComponent;
  let fixture: ComponentFixture<VicinityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VicinityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VicinityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
