import { NgModule } from '@angular/core';
import { AppConfigService } from '../../services/app-config.service';
import { StoreService } from '../../../business/services/store.service';
import { AlertService } from '../../../business/services/alert.service';
import { PatientService } from '../../../business/services/patient.service';
import { VaccinationService } from '../../../business/services/vaccination.service';
import { PaymentService } from '../../../business/services/payment.service';
import { ConsultationFormService } from '../../../business/services/consultation-form.service';
import { UtilsService } from '../../services/utils.service';
import { SharedModule } from '../../shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPermissionsService, NgxPermissionsModule } from 'ngx-permissions';
import { AuthService } from '../../services/auth.service';
import { ApiCmsManagementService } from '../../../business/services/api-cms-management.service';
import { ApiPatientInfoService } from '../../../business/services/api-patient-info.service';
import { ApiPatientVisitService } from '../../../business/services/api-patient-visit.service';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { AppConfigServiceSpy } from './AppConfigServiceSpy';
import { API_DOMAIN } from '../constants/app.constants';
import { getAccessToken } from '../../app.module';
import { LoggerService } from '../../services/logger.service';
import { VitalService } from '../../../business/services/vital.service';
import { ConsoleLoggerService } from '../../services/console-logger.service';
import { BsModalRef } from 'ngx-bootstrap';
import { DatePipe } from '@angular/common';
import { PrintTemplateService } from '../../../business/services/print-template.service';
import { ErrorLogService } from '../../services/error-log.service';
import { DialogService } from '../../services/dialog.service';
import { TempStoreService } from '../../services/temp-store.service';

@NgModule({
  imports: [
    SharedModule,
    RouterTestingModule,
    NgxPermissionsModule.forRoot(),
    HttpClientModule,
    HttpClientTestingModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: getAccessToken,
        whitelistedDomains: API_DOMAIN
      }
    })
  ],
  providers: [
    AppConfigService,
    ApiCmsManagementService,
    ApiPatientInfoService,
    ApiPatientVisitService,
    StoreService,
    TempStoreService,
    { provide: LoggerService, useClass: ConsoleLoggerService },
    AlertService,
    AuthService,
    JwtHelperService,
    PatientService,
    VaccinationService,
    PaymentService,
    VitalService,
    ConsultationFormService,
    UtilsService,
    NgxPermissionsService,
    BsModalRef,
    DatePipe,
    PrintTemplateService,
    ErrorLogService,
    DialogService,

    AppConfigServiceSpy
  ],
  exports: [SharedModule, RouterTestingModule, HttpClientModule, HttpClientTestingModule]
})
export class TestingModule {
  constructor(private spy: AppConfigServiceSpy) {}
}
