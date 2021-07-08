import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientUpdateConfirmationComponent } from './patient-update-confirmation.component';
import { TestingModule } from '../../../../app/util/test/testing.module';
import { FormBuilder } from '@angular/forms';

describe('PatientUpdateConfirmationComponent', () => {
  let component: PatientUpdateConfirmationComponent;
  let fixture: ComponentFixture<PatientUpdateConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [
        PatientUpdateConfirmationComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientUpdateConfirmationComponent);
    component = fixture.componentInstance;
    component.confirmationFormGroup = fixture.debugElement.injector.get(FormBuilder).group({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
