import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDetailAddDocumentComponent } from './patient-detail-add-document.component';
import { TestingModule } from '../../../../../app/util/test/testing.module';
import { PatientService } from '../../../../services/patient.service';
import { FormGroup } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';

describe('PatientDetailAddDocumentComponent', () => {
  let component: PatientDetailAddDocumentComponent;
  let fixture: ComponentFixture<PatientDetailAddDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDetailAddDocumentComponent);
    component = fixture.componentInstance;
    component.formGroup = fixture.debugElement.injector
      .get(PatientService)
      .createPatientDetailFormGroup()
      .get('documentsFormGroup') as FormGroup;

    component.uploader = new FileUploader({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
