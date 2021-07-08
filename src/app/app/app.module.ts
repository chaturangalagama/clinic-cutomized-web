import { VitalAddComponent } from '../business/components/vital/vital-add/vital-add.component';
import { VitalModule } from '../business/components/vital/vital.module';
import { PrintTemplateService } from '../business/services/print-template.service';
import { VitalService } from '../business/services/vital.service';
import { ErrorLogService } from './services/error-log.service';

import { AppConfigService } from './services/app-config.service';
import { DatePipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import {
  APP_SIDEBAR_NAV,
  AppAsideComponent,
  AppBreadcrumbsComponent,
  AppFooterComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  AppSidebarFooterComponent,
  AppSidebarFormComponent,
  AppSidebarHeaderComponent,
  AppSidebarMinimizerComponent
} from './app-components';

import { FullLayoutComponent, SimpleLayoutComponent } from './containers';
import {
  AsideToggleDirective,
  NAV_DROPDOWN_DIRECTIVES,
  ReplaceDirective,
  SIDEBAR_TOGGLE_DIRECTIVES
} from './util/directives';
import { AlertService } from '../business/services/alert.service';
import { ApiCmsManagementService } from '../business/services/api-cms-management.service';
import { ApiPatientInfoService } from '../business/services/api-patient-info.service';
import { ApiPatientVisitService } from '../business/services/api-patient-visit.service';
import { AuthGuardService } from './services/auth-guard.service';
import { PermissionsGuardService } from './services/permissions-guard.service';
import { AuthService } from './services/auth.service';
import { CanDeactivateGuardService } from './services/can-deactivate-guard.service';
import { ConsoleLoggerService } from './services/console-logger.service';
import { ConsultationFormService } from '../business/services/consultation-form.service';
import { DialogService } from './services/dialog.service';
import { LoggerService } from './services/logger.service';
import { PatientService } from '../business/services/patient.service';
import { PaymentService } from '../business/services/payment.service';
import { StoreService } from '../business/services/store.service';
import { UtilsService } from './services/utils.service';
import { VaccinationService } from '../business/services/vaccination.service';
import { SharedModule } from './shared.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { API_DOMAIN } from './util/constants/app.constants';
import { TempStoreService } from './services/temp-store.service';
import { RefreshTokenInterceptor } from './services/refresh-token-interceptor';
import { ChargeFormService } from '../business/services/charge-form.service';

// HTTP MODULE
// Services
// Routing
const APP_CONTAINERS = [FullLayoutComponent, SimpleLayoutComponent];

// Import components
const APP_COMPONENTS = [
  AppAsideComponent,
  AppBreadcrumbsComponent,
  AppFooterComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  AppSidebarFooterComponent,
  AppSidebarFormComponent,
  AppSidebarHeaderComponent,
  AppSidebarMinimizerComponent,
  APP_SIDEBAR_NAV
];

// Import directives
const APP_DIRECTIVES = [AsideToggleDirective, NAV_DROPDOWN_DIRECTIVES, ReplaceDirective, SIDEBAR_TOGGLE_DIRECTIVES];

export function getAccessToken() {
  return localStorage.getItem('access_token');
}

const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    return appConfig.loadAppConfig();
  };
};

// Import 3rd party components
@NgModule({
  declarations: [AppComponent, ...APP_CONTAINERS, ...APP_COMPONENTS, ...APP_DIRECTIVES],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    HttpClientModule,
    SharedModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: getAccessToken,
        whitelistedDomains: API_DOMAIN
      }
    }),
    NgxPermissionsModule.forRoot(),
    ReactiveFormsModule,
    AppRoutingModule
  ],
  entryComponents: [],

  providers: [
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigService]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (ps: NgxPermissionsService) =>
        function() {
          return new Promise((resolve, reject) => {
            if (localStorage.getItem('roles')) {
              resolve(localStorage.getItem('roles'));
            } else {
              resolve('');
            }
          }).then((data: string) => {
            console.log('Roles Loaded', data);
            if (data) {
              return ps.loadPermissions(JSON.parse(data));
            }
          });
        },
      deps: [NgxPermissionsService],
      multi: true
    },
    { provide: LoggerService, useClass: ConsoleLoggerService },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RefreshTokenInterceptor,//JwtInterceptor,
      multi: true
    },

    ErrorLogService,
    DatePipe,

    StoreService,
    AlertService,
    AuthService,
    VitalService,
    TempStoreService,

    ApiCmsManagementService,
    ApiPatientInfoService,
    ApiPatientVisitService,
    DialogService,
    PatientService,
    VaccinationService,
    AuthGuardService,
    PermissionsGuardService,
    CanDeactivateGuardService,
    JwtHelperService,
    PaymentService,
    ConsultationFormService,
    ChargeFormService,
    UtilsService,
    BsModalService,
    NgxPermissionsService,
    PrintTemplateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
