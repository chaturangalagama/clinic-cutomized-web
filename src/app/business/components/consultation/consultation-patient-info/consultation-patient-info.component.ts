import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { ApiCmsManagementService } from '../../../services/api-cms-management.service';
import { ApiPatientVisitService } from '../../../services/api-patient-visit.service';
import { UtilsService } from '../../../../app/services/utils.service';
import { AlertService } from '../../../services/alert.service';
import { Allergy } from '../../../../app/util/objects/response/Allergy';
import { MedicalAlert } from '../../../../app/util/objects/response/MedicalAlert';
import { MedicalAlertResponse } from '../../../../app/util/objects/response/MedicalAlertResponse';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiPatientInfoService } from '../../../services/api-patient-info.service';
import { Component, OnInit, Input, SimpleChanges, OnDestroy } from '@angular/core';
import { StoreService } from '../../../services/store.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { UserRegistrationObject } from '../../../../app/util/objects/UserRegistrationObject';
import { DISPLAY_DATE_FORMAT } from '../../../../app/util/constants/app.constants';

@Component({
  selector: 'app-consultation-patient-info',
  templateUrl: './consultation-patient-info.component.html',
  styleUrls: ['./consultation-patient-info.component.scss']
})
export class ConsultationPatientInfoComponent implements OnInit, OnDestroy {
  @Input() hideAlerts = false;
  @Input() patientNameRedirect = false;
  @Input() patientChange = false;
  // selectedItems: SelectedItem[];
  bsModalRef: BsModalRef;
  alerts: Array<Allergy>;
  medicalAlerts: Array<MedicalAlertResponse>;
  patientInfo: UserRegistrationObject;

  patientId: string;
  patientNo: string;
  patientName: string;
  age: string;
  sex: string;
  dob: string;
  nric: string;
  occupation: string;
  address: string;
  address1: string;
  address2: string;
  postal: string;
  maritalStatus: string;
  contactNo: string;

  private componentDestroyed: Subject<void> = new Subject();

  constructor(
    private apiPatientInfoService: ApiPatientInfoService,
    private apiPatientVisitService: ApiPatientVisitService,
    private apiCmsManagementService: ApiCmsManagementService,
    private storeService: StoreService,
    private router: Router,
    private alertService: AlertService,
    private utilService: UtilsService,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {

    this.initPatientInfo('', '', null, '', '', '', '', '', '', '', '', '', '');
    this.initPatientDetails();

    this.storeService.currentPatientId.pipe(takeUntil(this.componentDestroyed)).subscribe(id => {
      this.initPatientInfo('', '', null, '', '', '', '', '', '', '', '', '', '');

      this.patientId = id;
      this.initPatientDetails();
    });
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.unsubscribe();
  }

  initPatientDetails() {
    this.initPage();
  }

  initPage() {
    const patientId = this.storeService.getPatientId();

    this.apiPatientInfoService.searchBy('systemuserid', patientId).subscribe(
      res => {
        this.patientInfo = res.payload;
        const { address } = this.patientInfo;

        const separatedAddress = (address.address || '').split('\n');

        const { company } = this.patientInfo;
        let occupation = '';
        if (company) {
          occupation = company.occupation;
        }

        console.log('this.patientInfo: ', this.patientInfo);

        let age = moment().diff(moment(this.patientInfo.dob, DISPLAY_DATE_FORMAT), 'years');
        let ageQuantifier = ' years';
        console.log('PATIENT AGE', age);
        if (age < 1) {
          age = moment().diff(moment(this.patientInfo.dob, DISPLAY_DATE_FORMAT), 'months');
          ageQuantifier = ' months';
        }
        if (age < 1) {
          age = moment().diff(moment(this.patientInfo.dob, DISPLAY_DATE_FORMAT), 'days');
          ageQuantifier = ' days';
        }
        console.log('PATIENT AGE', age);

        this.initPatientInfo(
          this.patientInfo.patientNumber ? this.patientInfo.patientNumber : '-',
          this.patientInfo.name,
          '' + age + ageQuantifier,
          this.patientInfo.gender,
          this.patientInfo.dob,
          this.patientInfo.userId.number,
          occupation,
          `${address.address}, ${address.postalCode}`,
          separatedAddress[0] ? separatedAddress[0] : '',
          // separatedAddress[1] || separatedAddress[1] !== undefined ? separatedAddress[1] : '',
          separatedAddress[1] ? separatedAddress[1] : '',
          `${address.postalCode}`,
          this.patientInfo.maritalStatus,
          `${
            this.patientInfo.contactNumber.number // `${this.patientInfo.contactNumber.countryCode}-${this.patientInfo.contactNumber.number}`
          }`
        );
        this.alerts = this.patientInfo.allergies;
        console.log('ALLERGY ALERTS: ', this.alerts);
      },
      err => {
        this.alertService.error(JSON.stringify(err.error.message));
      }
    );

    this.medicalAlerts = Array<MedicalAlertResponse>();
    this.apiPatientInfoService.listAlert(patientId).subscribe(
      res => {
        if (res.payload) {
          const alertDetails = <Array<MedicalAlertResponse>>res.payload.details;
          const tempAlertArray = Array<MedicalAlertResponse>();
          alertDetails.forEach(alert => {
            if (alert.alertType !== 'ALLERGY') {
              tempAlertArray.push(alert);
            }
          });
          this.medicalAlerts = tempAlertArray;
          console.log('MEDICAL ALERTS: ', this.medicalAlerts);
        }
      },
      err => {
        this.alertService.error(JSON.stringify(err.error.message));
      }
    );
  }

  initPatientInfo(
    patientNo: string,
    patientName: string,
    age: string,
    sex: string,
    dob: string,
    nric: string,
    occupation: string,
    address: string,
    address1: string,
    address2: string,
    postal: string,
    maritalStatus: string,
    contactNo: string
  ) {
    this.patientNo = patientNo;
    this.patientName = patientName;
    this.age = age;
    this.sex = sex;
    this.dob = dob;
    this.nric = nric;
    this.occupation = occupation;
    this.address = this.utilService.convertToTitleCaseUsingSpace(address);
    this.address1 = this.utilService.convertToTitleCaseUsingSpace(address1);
    this.address2 = address2 === undefined ? '' : this.utilService.convertToTitleCaseUsingSpace(address2);
    this.postal = this.utilService.convertToTitleCaseUsingSpace(postal);
    this.maritalStatus = maritalStatus;
    this.contactNo = contactNo;
  }

  openPatientDetail() {
    window.open(`/pages/patient/detail/${this.patientInfo.id}`);
    // this.router.navigate([`/pages/patient/detail/${this.patientInfo.id}`]);
  }

  getPatientDetailRoute() {
    if (this.patientInfo && this.patientInfo.id) {
      return `/pages/patient/detail/${this.patientInfo.id}`;
    } else {
      return '';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes: ', changes);
  }

  textTruncate(str: String){
    let truncatedStr = '';
    let maxLength = 30;
    if(str && str.length > maxLength ){
      truncatedStr = str.substring(0,maxLength) + '...'
      return truncatedStr;
    }else{
      return str;
    }
  }
}
