import { ConsultationComponentsModule } from '../../components/consultation/consultation-components.module';
import { PaymentRoutingModule } from '../payment/payment-routing.module';
import { PaymentComponentsModule } from '../../components/payment/payment-components.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { PatientDetailComponentsModule } from '../../components/patient-detail/patient-detail-components.module';
import { PatientDetailLayoutComponent } from '../../../app/containers/patient-detail-layout';
import { PatientAddComponentsModule } from '../../components/patient-add/patient-add-components.module';
import { SharedModule } from '../../../app/shared.module';
import { PatientAddComponent } from './patient-add/patient-add.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { PatientRoutingModule } from './patient-routing.module';
import { PatientSearchComponent } from './patient-search/patient-search.component';
import { PatientVisitComponent } from '../patient-visit/patient-visit/patient-visit.component';
import { ConsultationComponent } from '../patient-visit/consultation/consultation.component';
import { QueueComponent } from '../patient-visit/queue/queue.component';
import { QueueItemComponent } from '../patient-visit/queue/queue-item/queue-item.component';
import { PatientProfileComponent } from './patient-profile/patient-profile.component';
import { PatientConsultationComponent } from '../patient-visit/consultation/patient-consultation/patient-consultation.component';
import { PatientDispensingComponent } from './patient-dispensing/patient-dispensing.component';
import { PatientMedicalServicesComponent } from './patient-medical-services/patient-medical-services.component';
import { DynamicFormContainerComponent } from '../../../app/app-components/dynamic-form-container/dynamic-form-container.component';
@NgModule({
  imports: [
    CommonModule,
    PatientRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    PatientDetailComponentsModule,
    PatientAddComponentsModule,
    PaymentRoutingModule,
    PaymentComponentsModule,
    ConsultationComponentsModule
  ],
  declarations: [
    PatientDetailLayoutComponent,
    PatientListComponent,
    PatientAddComponent,
    PatientDetailComponent,
    PatientSearchComponent,
    DynamicFormContainerComponent,
    PatientVisitComponent,
    ConsultationComponent,
    QueueComponent,
    QueueItemComponent,
    PatientProfileComponent,
    PatientConsultationComponent,
    PatientDispensingComponent,
    PatientMedicalServicesComponent
  ]
})
export class PatientModule {}
