import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorComponentComponent } from './monitor-component.component';

describe('MonitorComponentComponent', () => {
  let component: MonitorComponentComponent;
  let fixture: ComponentFixture<MonitorComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
