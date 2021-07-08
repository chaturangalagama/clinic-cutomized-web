import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAddConsultationComponent } from './patient-add-consultation.component';
import { TestingModule } from '../../../../app/util/test/testing.module';
import { FormBuilder, FormControl } from '@angular/forms';

describe('PatientAddConsultationComponent', () => {
  let component: PatientAddConsultationComponent;
  let fixture: ComponentFixture<PatientAddConsultationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAddConsultationComponent);
    component = fixture.componentInstance;
    component.consultationInfoFormGroup = new FormBuilder().group({
      visitDate: new FormControl(),
      time: '',
      preferredDoctor: '',
      purposeOfVisit: '',
      remarks: ''
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
