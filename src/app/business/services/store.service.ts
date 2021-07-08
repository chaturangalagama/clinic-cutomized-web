import { distinctUntilChanged, debounceTime, switchMap, take } from 'rxjs/operators';
import { UtilsService } from '../../app/services/utils.service';
import { DISPLAY_DATE_FORMAT, DB_FULL_DATE_FORMAT, INPUT_DELAY } from '../../app/util/constants/app.constants';
import { StoreStatus } from '../../app/util/objects/StoreStatus';
import { Practice } from '../../app/util/objects/SpecialityByClinic';
import { Router } from '@angular/router';
import { Observable, Subject, timer, BehaviorSubject } from 'rxjs';
import { Clinic } from '../../app/util/objects/response/Clinic';
import { Injectable, OnDestroy } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';

import { LoggerService } from '../../app/services/logger.service';
import { ApiPatientVisitService } from './api-patient-visit.service';
import { ApiPatientInfoService } from './api-patient-info.service';
import { AllergyGroup } from '../../app/util/objects/response/AllergyGroup';
import { PatientRegistryListResponse } from '../../app/util/objects/response/PatientRegistryListResponse';
import { AuthService } from '../../app/services/auth.service';
import { User } from '../../app/util/objects/response/User';

import { Instruction, DosageInstruction } from '../../app/util/objects/DrugItem';
import { Uom } from '../../app/util/objects/Uom';
import { AlertService } from './alert.service';
import { ApiCmsManagementService } from './api-cms-management.service';

import { PatientService } from './patient.service';
import { PaymentService } from './payment.service';
import * as moment from 'moment';
import { VitalConfiguration } from '../../app/util/objects/response/VitalConfiguration';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Context } from 'vm';
@Injectable()
export class StoreService implements OnDestroy {
  private isClinicLoaded = new Subject();
  private headerRegistry = new Subject();
  private isStoreReady: BehaviorSubject<StoreStatus>;
  private patientIdRefresh = new Subject<string>();
  private patientVisitIdRefresh = new BehaviorSubject<any>([]);
  private patientInfoRefresh = new BehaviorSubject<any>([]);
  currentPatientId = this.patientIdRefresh.asObservable();
  currentPatientInfo;

  currentConsultationRoute = 'route1';

  private patientId: string;
  private queueNumber: string;
  private visitStatus: string;

  consultationId: string;
  private patientVisitRegistryId: string;
  private user: User;
  visitPurposeList = [];

  authorizedClinicList = [];
  private clinicList = new Array<Clinic>();

  doctorList = [];
  doctorListByClinic = [];
  clinicId: string;
  clinicCode: string;
  clinic: Clinic;

  chargeItemList = [];
  activeChargeItemList = [];
  chargeItemListOptions = [];
  allergyGroupList: AllergyGroup[] = [];
  allergyGroupListOptions = [];

  uoms: Array<Uom> = new Array();

  specialitiesList: Practice[];

  patientRegistry: Array<PatientRegistryListResponse>;

  errorMessages = [];

  notificationList = [];
  unreadNotificationList = [];
  notificationPolling: any;
  registryPolling: any;

  private templates: {};
  private instructions: Array<Instruction>;
  private dosageInstructions: Array<DosageInstruction>;
  vitalConfigurations: Array<VitalConfiguration>;
  vitalConfigurationsForAdd: Array<VitalConfiguration>;
  defaultVitals: Array<VitalConfiguration>;

  // Store Status
  private storeSuccessCount = 0;
  private storeFailCount = 0;
  private storeStatus: StoreStatus;
  private API_COUNTS = 10;//11

  constructor(
    private permissionsService: NgxPermissionsService,
    private authService: AuthService,
    private alertService: AlertService,
    private apiCmsManagementService: ApiCmsManagementService,
    private apiPatientInfoService: ApiPatientInfoService,
    private patientService: PatientService,
    private paymentService: PaymentService,
    private utilsService: UtilsService,
    private apiPatientVisitService: ApiPatientVisitService,
    private logger: LoggerService,
    private router: Router,
    public jwtHelper: JwtHelperService
  ) {
    this.storeStatus = new StoreStatus(false, false, false);
    this.isStoreReady = new BehaviorSubject(this.storeStatus);

    if (
      localStorage.getItem('access_token') &&
      localStorage.getItem('clinicCode') &&
      localStorage.getItem('clinicId')
    ) {
      this.clinicCode = localStorage.getItem('clinicCode');
      this.clinicId = localStorage.getItem('clinicId'); // preInit would have been called
    } else {
      console.log("can't");
    }

    this.preInit();
  }

  preInit() {
    console.log('Store pre-Init');
    this.storeSuccessCount = 0;
    this.storeFailCount = 0;
    this.storeStatus.hasError = false;
    this.storeStatus.isLoaded = false;
    this.storeStatus.isReseting = true;
    this.isStoreReady.next(this.storeStatus);
    if (this.authService.isAuthenticated()) {
      const decodeToken = this.jwtHelper.decodeToken(localStorage.getItem('access_token'));
      localStorage.setItem('roles', JSON.stringify(decodeToken.authorities));
      const user_details = JSON.parse(localStorage.getItem('user_details'));
      const cmsUserId = user_details['cmsUserId'];
      if(user_details != null){
        this.user = {
          createDate: user_details['createDate'],
          lastUpdate: user_details['lastUpdate'],
          userName: decodeToken.user_name,
          password: '',
          firstName: user_details['firstName'],
          lastName: user_details['lastName'],
          email: user_details['email'],
          status: user_details['status'],
          oldPasswords: '',
          numberOfLoginAttempts: user_details['numberOfLoginAttempts'],
          roles: decodeToken.authorities,
          context: {'cms-user-id': cmsUserId}
          // context: user_details['context']
        }
        console.log("Current user's details", this.user);
      }else{
        console.log('Error in retrieving current users details');
        this.alertService.error(JSON.stringify('Error in retrieving current users details'));
        this.errorMessages['user_details'] = 'Error in retrieving current users details';
        this.setStoreReady(false);
      }
      this.permissionsService.loadPermissions(decodeToken.authorities);
      this.authService.permissionsLoaded = true;
      this.listTemplates();
      this.initStore();
    }
  }

  refreshPatientId(patientId: string) {
    this.patientIdRefresh.next(patientId);
  }

  ngOnDestroy() {
    this.unsubscribeNotificationPolling();
    this.unsubscribeRegistryPolling();
  }

  initStore() {
    // this.authService.isLogout().subscribe(data => {
    //   this.logoutClearUp();
    // });
    this.alertService.getMessage().subscribe(msg => console.log(msg));

    this.apiCmsManagementService.listClinics().subscribe(
      res => {
        if (res.payload) {
          this.clinicList = res.payload;
          console.log('GOT CLINIC LIST: ', res.payload);
          // this.clinicclinic = res.payload;
          this.isClinicLoaded.next(res.payload);
          console.log('111 ai ISCLINICLOADED: ', res.payload);
          this.isClinicLoaded.complete();
          this.clinic = this.clinicList.find(clinic => clinic.id === this.clinicId);
          this.setStoreReady(true);
        }
      },
      err => {
        this.alertService.error(JSON.stringify(err));
        this.errorMessages['listClinics'] = err;
        this.setStoreReady(false);
      }
    );

    this.apiCmsManagementService.listVisitPurposes().subscribe(
      res => {
        console.log('GOT VISIT PURPOSE LIST', res.payload);
        this.visitPurposeList = res.payload;
        this.setStoreReady(true);
      },
      err => {
        this.alertService.error(JSON.stringify(err));
        this.errorMessages['listVisitPurposes'] = err;
        this.setStoreReady(false);
      }
    );
    this.apiCmsManagementService.listDoctors().subscribe(
      res => {
        console.log('GOT DOCTOR LIST', res.payload);
        this.doctorList = res.payload;
        this.setStoreReady(true);
      },
      err => {
        console.log('ERROR IN RETRIEVING DOCTOR LIST,', err);
        this.alertService.error(JSON.stringify(err));
        this.errorMessages['listDoctorsByClinic'] = err;
        this.setStoreReady(false);
      }
    );
    this.listDoctorsByClinic();

    this.apiPatientInfoService.listAllergyGroups().subscribe(
      res => {
        console.log('GOT ALLERGY GROUP LIST');
        this.allergyGroupList = res.payload;
        this.allergyGroupListOptions = this.allergyGroupList.map(allergy => {
          return {
            value: allergy.id,
            label: allergy.groupCode
          };
        });
        this.setStoreReady(true);
      },
      err => {
        this.alertService.error(JSON.stringify(err));
        this.errorMessages['listAllergyGroups'] = err;
        this.setStoreReady(false);
      }
    );
    this.apiCmsManagementService.listSpecialities().subscribe(
      data => {
        if (data.payload) {
          // this.populatePractice(data.payload);
          this.specialitiesList = data.payload;
        }
        this.setStoreReady(true);
      },
      err => {
        this.alertService.error(JSON.stringify(err.error.message));
        this.setStoreReady(false);
      }
    );

    this.apiCmsManagementService.listInstructions().subscribe(
      data => {
        const { payload } = data;
        if (payload) {
          this.instructions = payload['INSTRUCTIONS'] ? payload['INSTRUCTIONS'] : [];
          this.dosageInstructions = payload['DOSAGE_INSTRUCTIONS'] ? payload['DOSAGE_INSTRUCTIONS'] : [];
          this.uoms = payload['UOMS'] ? payload['UOMS'] : [];
          console.log('DOSAGE INSTRUCTIONS', this.instructions, this.dosageInstructions);
        }
        this.setStoreReady(true);
      },
      err => {
        this.alertService.error(JSON.stringify(err.error.message));
        this.setStoreReady(false);
      }
    );

    this.apiCmsManagementService.listChargeItems().subscribe(
      res => {
        console.log('GOT CHARGE ITEM LIST');
        this.chargeItemList = res.payload;
        this.activeChargeItemList = this.chargeItemList.filter(item => {
          if (item.item.status === 'ACTIVE') {
            return item;
          }
        });
        this.chargeItemListOptions = this.chargeItemList.map(item => {
          return {
            value: item.id,
            label: item.name
            // code: item.code
          };
        });
        this.setStoreReady(true);
      },
      err => {
        this.alertService.error(JSON.stringify(err));
        this.errorMessages['listChargeItems'] = err;
        this.setStoreReady(false);
      }
    );

    this.getVitalConfigurations();
    this.getDefaultVitals();

    // this.updatePatientRegistryList();
    this.startHeaderRegistryPolling();
    this.startNotificationPolling();
  }

  listDoctorsByClinic() {
    if (this.clinicId) {
      this.apiCmsManagementService.listDoctorsByClinic(this.clinicId).subscribe(
        res => {
          console.log('GOT CLINIC DOCTOR LIST', res.payload);
          this.doctorListByClinic = res.payload;
          this.setStoreReady(true);
        },
        err => {
          console.log('ERROR IN RETRIEVEING DOCTOR LIST,', err);
          this.alertService.error(JSON.stringify(err));
          this.errorMessages['listDoctors'] = err;
          this.setStoreReady(false);
        }
      );
    }
  }

  setStoreReady(hasSucceeded: boolean) {
    if (hasSucceeded) {
      this.storeSuccessCount++;
    } else {
      this.storeFailCount++;
    }

    console.log('isStoreReady Count', this.storeSuccessCount, this.storeFailCount);

    if (this.storeSuccessCount >= this.API_COUNTS) {
      this.storeStatus.hasError = false;
      this.storeStatus.isLoaded = true;
      this.storeStatus.isReseting = false;
      console.log('​StoreService -> setStoreReady -> this.storeStatus', this.storeStatus);
      this.isStoreReady.next(this.storeStatus);
    } else if (this.storeSuccessCount + this.storeFailCount === this.API_COUNTS) {
      this.storeStatus.hasError = true;
      this.storeStatus.isLoaded = true;
      this.storeStatus.isReseting = false;
      console.log('​StoreService -> setStoreReady -> this.storeStatus(fail)', this.storeStatus);
      this.isStoreReady.next(this.storeStatus);
    }
  }

  getStoreStatus(): StoreStatus {
    return this.storeStatus;
  }

  startHeaderRegistryPolling() {
    if (!this.registryPolling) {
      this.registryPolling = timer(0, 20000).subscribe(val => {
        this.updatePatientRegistryList();
      });
    }
  }

  unsubscribeNotificationPolling() {
    if (this.notificationPolling) {
      this.notificationPolling.unsubscribe();
      this.notificationPolling = null;
    }
  }

  startNotificationPolling() {
    if (!this.notificationPolling) {
      this.notificationPolling = timer(1000, 20000).subscribe(val => {
        this.updateNotificationList();
      });
    }
  }

  unsubscribeRegistryPolling() {
    if (this.registryPolling) {
      this.registryPolling.unsubscribe();
      this.registryPolling = null;
    }
  }

  getVitalConfigurations() {
    this.apiCmsManagementService.listAllVitalConfigurations().subscribe(
      res => {
        if (res.payload) {
          console.log('​StoreService -> getVitalConfigurations -> res.payload', res.payload);
          // this.vitalConfigurationsForAdd = [];
          this.vitalConfigurationsForAdd = [];
          res.payload.forEach(vital => {
            const newVital = Object.assign({}, vital);
            this.vitalConfigurationsForAdd.push(newVital);
          });

          this.vitalConfigurations = [];
          res.payload.forEach(vital => {
            const newVital = Object.assign({}, vital);
            this.vitalConfigurations.push(newVital);
          });
          console.log('​StoreService -> getVitalConfigurations -> this.vitalConfigurations', this.vitalConfigurations);
          this.setStoreReady(true);
        }
      },
      err => {
        this.errorMessages['getVitalConfiguration'] = err;
        this.setStoreReady(false);
      }
    );
  }

  getDefaultVitals() {
    this.apiCmsManagementService.listDefaultVitals().subscribe(
      res => {
        if (res.payload) {
          console.log('TCL: StoreService -> getDefaultVitals -> res.payload', res.payload);

          const strDefaultVitals = JSON.stringify(res.payload);
          this.defaultVitals = [];

          this.defaultVitals = JSON.parse(strDefaultVitals);
          console.log('TCL: StoreService -> getDefaultVitals -> this.defaultVitals', this.defaultVitals);

          this.setStoreReady(true);
        }
      },
      err => {
        this.errorMessages['getDefaultVitals'] = err;
        this.setStoreReady(false);
      }
    );
  }

  getAuthorizedClinicList() {
    const tempArray = [];

    if (this.user) {
      this.clinicList.map(clinic => {
        clinic.clinicStaffUsernames.forEach(staffUsername => {
          if (staffUsername === this.user.userName) {
            tempArray.push(clinic);
          } else {
          }
        });
      });
    }
    this.authorizedClinicList = tempArray;
    return tempArray;
  }

  getAllergyGroupList() {
    this.apiPatientInfoService.listAllergyGroups().subscribe(
      res => {
        console.log('GOT ALLERGY GROUP LIST');
        this.allergyGroupList = res.payload;
        this.allergyGroupListOptions = this.allergyGroupList.map(allergy => {
          return {
            value: allergy.id,
            label: allergy.groupCode
          };
        });
      },
      err => {
        this.alertService.error(JSON.stringify(err));
        this.errorMessages['listAllergyGroups'] = err;
      }
    );
  }

  getVisitPurposeList() {
    this.apiCmsManagementService.listVisitPurposes().subscribe(
      res => {
        console.log('GOT VISIT PURPOSE LIST');
        this.visitPurposeList = res.payload;
      },
      err => {
        this.alertService.error(JSON.stringify(err));
        this.errorMessages['listVisitPurposes'] = err;
      }
    );
  }

  getListOfDoctors() {
    this.apiCmsManagementService.listDoctors().subscribe(
      res => {
        console.log('GOT DOCTOR PURPOSE LIST', res.payload);
        this.doctorList = res.payload;
      },
      err => {
        this.alertService.error(JSON.stringify(err));
        this.errorMessages['listDoctors'] = err;
      }
    );
  }

  updatePatientRegistryList() {
    if (this.clinicId) {
      this.apiPatientVisitService
        .patientRegistryListWithStartTime(
          this.clinicId,
          moment()
            .startOf('day')
            .format(DB_FULL_DATE_FORMAT),
          moment()
            .endOf('day')
            .format(DB_FULL_DATE_FORMAT)
        )
        .subscribe(
          data => {
            if (data.payload) {
              this.patientRegistry = [...data.payload];
              this.patientRegistry = data.payload;
              this.logger.info('Patient Registry', this.patientRegistry);
              this.headerRegistry.next(this.patientRegistry);
            }
          },
          err => this.alertService.error(JSON.stringify(err))
        );
    }
  }

  listTemplates() {
    if (this.permissionsService.getPermission('ROLE_CONSULTATION_TEMPLATE')) {
      this.apiCmsManagementService.listTemplates(this.getUser().context['cms-user-id']).subscribe(
        res => {
          if (res.payload && res.payload.templates) {
            this.setTemplates(res.payload.templates);
          }
        },
        err => {
          this.alertService.error(JSON.stringify(err));
        }
      );
    }
  }

  findClinic(clinicId: string) {
    return this.clinicList.find(element => element.id === clinicId);
  }

  findActiveItem(code: string) {
    return this.activeChargeItemList.find(element => element.item.code === code);
  }

  getDoctors() {
    return this.doctorList;
  }

  getActiveDoctors() {
    return this.doctorList.filter(element => element.status === 'ACTIVE');
  }

  findDoctorById(doctorId: string) {
    return this.doctorList.find(element => element.id === doctorId);
  }

  getUser(): User {
    return this.user;
  }

  getUserId(): string {
    return this.user.context['cms-user-id'];
  }

  getUserLabel(): string {
    return this.user ? this.user.userName.slice(0, 1).toUpperCase() : '';
  }

  getClinicId(): string {
    return this.clinicId;
  }

  getClinic(): Clinic {
    return this.clinicList.find(clinic => clinic.id === this.clinicId);
  }

  getPatientId(): string {
    return this.patientId;
  }

  getPatientVisitRegistryId(): string {
    return this.patientVisitRegistryId;
  }

  getConsultationId(): string {
    return this.consultationId;
  }


  getClinicList(page: number = 0, size: number = 10000) {
    return this.clinicList.slice(size * page, size * (page + 1));
  }

  getDoctorList(page: number = 0, size: number = 10000) {
    if (this.doctorList.length === 0) {
      console.log('GETTING DOCTORS');
      this.getListOfDoctors();
    } else {
      return this.doctorList.slice(size * page, size * (page + 1));
    }
  }

  getPatientIdRefresh() {
    return this.patientIdRefresh;
  }

  getPatientVisitIdRefresh() {
    console.log('RETURNING  VISIT ID: ', this.patientVisitIdRefresh);
    return this.patientVisitIdRefresh;
  }

  getPatientInfoRefresh() {
    console.log('#006 Returning Patient Info Refresh');
    return this.patientInfoRefresh;
  }

  getPatientInfo() {
    console.log('#006 Returning Patient Info', this.currentPatientInfo);
    this.currentPatientInfo;
  }

  setPatientId(id: string) {
    console.log('SETTING PATIENT ID: ', id);
    this.patientId = id;
    this.patientService.resetPatientDetailFormGroup();
    this.patientIdRefresh.next(this.patientId);

    if (id) {
      this.apiPatientInfoService
        .searchBy('systemuserid', this.getPatientId())
        .pipe(
          distinctUntilChanged(),
          debounceTime(INPUT_DELAY)
        )
        .subscribe(
          res => {
            this.patientInfoRefresh.next(res.payload);
            this.currentPatientInfo = res.payload;
            console.log('#006 Sending out Patient Info: ', res.payload);
          },
          err => {
            this.alertService.error(JSON.stringify(err));
            this.setPatientId('');
            this.router.navigate(['pages/patient/list']);
          }
        );
    }
  }

  setPatientVisitRegistryId(id: string, withRefresh: boolean) {
    console.log('SETTING VISIT ID: ', id);
    this.patientVisitRegistryId = id;

    this.paymentService.resetChargeFormGroup();
    this.paymentService.resetCollectFormGroup();

    if (withRefresh) {
      this.patientVisitIdRefresh.next(id);
    }
  }

  // initialisePatientVisitRegistryId(id: string){
  //   this.patientVisitRegistryId = id;
  //   this.paymentService.resetChargeFormGroup();
  //   this.paymentService.resetCollectFormGroup();
  // }

  setConsultationId(id: string) {
    this.consultationId = id;
    this.paymentService.resetChargeFormGroup();
    this.paymentService.resetCollectFormGroup();
  }

  getNotificationList() {
    return this.notificationList;
  }

  getUnreadNotificationList() {
    return this.unreadNotificationList;
  }

  getIsClinicLoaded(): Observable<any> {
    console.log('111 aisClinic)');
    return this.isClinicLoaded.asObservable();
  }

  getDoctorId() {
    return this.getUser().context['cms-user-id'];
  }

  resetClinicLoaded() {
    this.isClinicLoaded = new Subject();
  }

  getHeaderRegistry() {
    return this.headerRegistry.asObservable();
  }

  resetHeaderRegistry() {
    this.headerRegistry = new Subject();
  }

  getIsStoreReady(): Observable<any> {
    return this.isStoreReady.asObservable();
  }

  resetIsStoreReady() {
    this.isStoreReady = new BehaviorSubject(this.storeStatus);
  }

  updateNotificationList() {
    if (this.authService.isAuthenticated()) {
      this.apiPatientInfoService.listNotifications().subscribe(res => {
        this.notificationList = res.payload;
        this.unreadNotificationList = this.notificationList.filter(notification => !notification.read);
      });
    } else {
      this.unsubscribeNotificationPolling();
    }
  }

  updateUnreadNotificationList() {
    this.unreadNotificationList = this.notificationList.filter(notification => !notification.read);
  }

  // logoutClearUp() {
  //   this.unsubscribeNotificationPolling();
  //   this.unsubscribeRegistryPolling();
  //   this.clinicCode = '';
  //   this.clinicId = '';
  //   this.router.navigate(['login']);
  //   this.storeSuccessCount = 0;
  // }

  getTemplates() {
    return this.templates;
  }

  setTemplates(templates) {
    this.templates = templates;
  }

  getInstructions(): Array<Instruction> {
    return this.instructions;
  }
  getDosageInstructions(): Array<DosageInstruction> {
    return this.dosageInstructions;
  }

  getDosageInstructionByCode(code: string){
       return this.dosageInstructions.find( dosage =>{
          return dosage.code === code});
  }

  getVisitStatus(): string {
    return this.visitStatus;
  }
  setVisitStatus(value: string) {
    this.visitStatus = value;
  }

  getQueueNumber(): string {
    return this.queueNumber;
  }
  setQueueNumber(value: string) {
    this.queueNumber = value;
  }
}
