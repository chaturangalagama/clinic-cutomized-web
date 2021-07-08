import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationMemoComponent } from './consultation-memo.component';
import { SharedModule } from '../../../../app/shared.module';
import { TestingModule } from '../../../../app/util/test/testing.module';
import { FormControl } from '@angular/forms';

describe('ConsultationMemoComponent', () => {
  let component: ConsultationMemoComponent;
  let fixture: ComponentFixture<ConsultationMemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, TestingModule],
      declarations: [ConsultationMemoComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationMemoComponent);
    component = fixture.componentInstance;
    component.memo = new FormControl();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
