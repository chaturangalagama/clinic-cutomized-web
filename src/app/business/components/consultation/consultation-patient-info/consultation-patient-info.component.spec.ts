import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationPatientInfoComponent } from './consultation-patient-info.component';
import { FormBuilder } from '@angular/forms';
import { SharedModule } from '../../../../app/shared.module';
import { TestingModule } from '../../../../app/util/test/testing.module';
import { ConsultationPatientAlertInfoComponent } from './consultation-patient-alert-info/consultation-patient-alert-info.component';

describe('ConsultationPatientInfoComponent', () => {
  let component: ConsultationPatientInfoComponent;
  let fixture: ComponentFixture<ConsultationPatientInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, TestingModule],
      declarations: [ConsultationPatientInfoComponent, ConsultationPatientAlertInfoComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationPatientInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
