import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAddConfirmationComponent } from './patient-add-confirmation.component';
import { TestingModule } from '../../../../app/util/test/testing.module';

describe('PatientAddConfirmationComponent', () => {
  let component: PatientAddConfirmationComponent;
  let fixture: ComponentFixture<PatientAddConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [
        PatientAddConfirmationComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAddConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
