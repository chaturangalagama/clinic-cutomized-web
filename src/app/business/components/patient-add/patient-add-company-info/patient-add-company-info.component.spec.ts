import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAddCompanyInfoComponent } from './patient-add-company-info.component';
import { TestingModule } from '../../../../app/util/test/testing.module';
import { Button } from 'protractor';
import { PatientService } from '../../../services/patient.service';
import { FormGroup } from '@angular/forms';

describe('PatientAddCompanyInfoComponent', () => {
  let component: PatientAddCompanyInfoComponent;
  let fixture: ComponentFixture<PatientAddCompanyInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [PatientAddCompanyInfoComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAddCompanyInfoComponent);
    component = fixture.componentInstance;

    const patientAddFormGroup = fixture.debugElement.injector.get(PatientService).createPatientAddFormGroup();
    component.companyInfoFormGroup = patientAddFormGroup.get('companyInfoFormGroup') as FormGroup;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
