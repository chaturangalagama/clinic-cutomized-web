import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationPrescriptionComponent } from './consultation-prescription.component';
import { SharedModule } from '../../../../app/shared.module';
import { TestingModule } from '../../../../app/util/test/testing.module';
import { PrescriptionItemComponent } from './prescription-item/prescription-item.component';
import { DiscountComponent } from '../discount/discount.component';
import { TouchedObjectDirective } from '../../../../app/util/directives/touched/touched.object.directive';
import { FormBuilder } from '@angular/forms';

describe('ConsultationPrescriptionComponent', () => {
  let component: ConsultationPrescriptionComponent;
  let fixture: ComponentFixture<ConsultationPrescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, TestingModule],
      declarations: [
        ConsultationPrescriptionComponent,
        PrescriptionItemComponent,
        TouchedObjectDirective
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationPrescriptionComponent);
    component = fixture.componentInstance;
    component.itemsFormArray = new FormBuilder().array([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
