// General Libraries
import { FormGroup, FormArray } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Services
import { StoreService } from '../../../../services/store.service';
import { ApiPatientVisitService } from '../../../../services/api-patient-visit.service';

// Objects
import { PatientVisitHistory } from '../../../../../app/util/objects/request/PatientVisitHistory';
import { DispatchDrugDetail } from '../../../../../app/util/objects/request/DrugDispatch';

// Constants
import { DB_FULL_DATE_FORMAT, INPUT_DELAY } from '../../../../../app/util/constants/app.constants';
import { PatientVisitList } from '../../../../../app/util/objects/response/PatientVisitList';
@Component({
  selector: 'app-patient-consultation',
  templateUrl: './patient-consultation.component.html',
  styleUrls: ['./patient-consultation.component.scss']
})
export class PatientConsultationComponent implements OnInit {
  @Input() visitManagementFormGroup: FormGroup;
  @Input() needRefresh: Subject<boolean>;
  @Input() patientInfo;

  // UI Boolean Manipulation
  referralShown = false;
  memoShown = false;
  medicalCertificateShown = false;
  followUpShown = false;

  recentVisit: PatientVisitList;
  @Output() copiedPrescription = new EventEmitter<any>();

  constructor(private store: StoreService, private apiPatientVisitService: ApiPatientVisitService) {}

  ngOnInit() {
    this.subscribeOnInit();
  }

  subscribeOnInit() {
    // Listen for refresh
    this.needRefresh.subscribe(value => {
      console.log('needRefresh: ', value);
    });
  }

  // To Display on Recent Visit
  getRecentVisitTime() {
    //  Example: 'DR CINDY XIE    28/12/2018   10:02
    let doctorId = this.recentVisit && this.recentVisit.patientReferralEntity && this.recentVisit.patientReferralEntity.consultation ? this.recentVisit.patientReferralEntity.consultation.doctorId : '';
    let consultDoctor = this.store
      .getDoctorList()
      .find(doctor => doctor.id === doctorId);

    let consultDoctorName = consultDoctor? consultDoctor.name : 'Doctor Unknown';

    const time = this.recentVisit ? this.recentVisit.startTime : '';

    let str =
    consultDoctorName +
      '\xA0\xA0\xA0\xA0\xA0\xA0\xA0' +
      moment(time, DB_FULL_DATE_FORMAT).format('DD/MM/YYYY') +
      '\xA0\xA0\xA0\xA0\xA0' +
      moment(time, DB_FULL_DATE_FORMAT).format('HH:mm');

    return str;
  }

  // Output Events from HistoryMainContainer
  getRecentVisit(visit) {
    this.recentVisit = visit;

    this.getRecentVisitTime();
  }

  copyPrescription(data) {
    this.copiedPrescription.emit(data);
  }
}
