import { AlertService } from '../../../services/alert.service';
import { ApiPatientInfoService } from '../../../services/api-patient-info.service';
import { StoreService } from '../../../services/store.service';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import * as moment from 'moment';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-patient-add-queue-confirmation',
  templateUrl: './patient-add-queue-confirmation.component.html',
  styleUrls: ['./patient-add-queue-confirmation.component.scss']
})
export class PatientAddQueueConfirmationComponent implements OnInit {
  @Input() hiddenTabs: boolean;

  consultationFormGroup: FormGroup;
  patientAddFormGroup: FormGroup;
  public event: EventEmitter<any> = new EventEmitter();
  tabRefresh: boolean;

  // Input Data
  title: string;

  // DATA BINDING
  consultationInfo = {
    preferredDoctor: '',
    remarks: '',
    purposeOfVisit: '',
    priority: '',
    visitDate: '',
    time: ''
  };
  visitDate: Date;
  time: string;
  preferredDoctor: string;
  remarks: string;
  purposeOfVisit: string;
  hasUpdatePriority: boolean;

  constructor(
    private fb: FormBuilder,
    private store: StoreService,
    private apiPatientInfoService: ApiPatientInfoService,
    private alertService: AlertService,
    private bsModalRef: BsModalRef
  ) {
  }

  onBtnSaveClicked($event) {
    this.event.emit(this.consultationInfo);
  }

  onBtnCloseClicked($event) {
    this.event.emit('Close');
  }

  ngOnInit() {
    this.consultationFormGroup = this.createConsultationPage();
    this.subscribeToValueChanges();
  }

  subscribeToValueChanges() {
    this.consultationFormGroup.valueChanges
      .pipe(
        debounceTime(50),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
      .subscribe(values => {
        console.log('CONSULTATION FORM:', values);
        this.visitDate = values.visitDate;
        this.time = moment(values.time).format('MM-DD-YYYY');
        this.purposeOfVisit = values.purposeOfVisit;
        this.remarks = values.remarks;
        this.preferredDoctor = values.preferredDoctor;
        this.consultationInfo.purposeOfVisit = values.purposeOfVisit;
        this.consultationInfo.priority = values.priority;
        this.consultationInfo.remarks = values.remarks;
        this.consultationInfo.preferredDoctor = values.preferredDoctor || undefined;
        console.log('consultation info:', this.consultationInfo);

        console.log(this.preferredDoctor);
      });
  }

  createConsultationPage(): FormGroup {
    console.log('returning Consultation Page Form');
    return this.fb.group({
      visitDate: new FormControl(),
      time: '', // '930',
      preferredDoctor: [''],
      purposeOfVisit: [''],
      priority: ['', Validators.required],
      remarks: '' // ['', Validators.required] // ,
    });
  }

  disableConfirmBtn() {
    if (!this.consultationFormGroup.valid) {
      return true;
    }
  }

  hideConsultationInfo() {
    return false;
  }

  onSelect($event) {
    this.tabRefresh = $event.heading === 'Schedule Appointment' ? true : false;
  }

  hideTabs() {
    return this.hiddenTabs;
  }

  hideModal() {
    this.bsModalRef.hide();
  }
}
