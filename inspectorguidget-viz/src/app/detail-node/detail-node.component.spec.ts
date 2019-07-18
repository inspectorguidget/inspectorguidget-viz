import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailNodeComponent } from './detail-node.component';

describe('DetailNodeComponent', () => {
  let component: DetailNodeComponent;
  let fixture: ComponentFixture<DetailNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
